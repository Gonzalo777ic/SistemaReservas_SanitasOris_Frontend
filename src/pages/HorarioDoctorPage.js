import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function HorarioDoctorPage() {
  const { user, getAccessTokenSilently } = useAuth0();
  const [doctorId, setDoctorId] = useState(null);
  const [horarios, setHorarios] = useState([]);

  const diasSemana = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  // Obtener doctor del usuario
  useEffect(() => {
    const fetchDoctorId = async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await api.get("doctores/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const doctor = res.data.find(
          (d) => d.user?.email === user.email || d.email === user.email
        );
        if (doctor) setDoctorId(doctor.id);
      } catch (err) {
        console.error("Error al obtener doctor:", err);
      }
    };
    fetchDoctorId();
  }, [getAccessTokenSilently, user.email]);

  // Cargar horarios
  useEffect(() => {
    const fetchHorarios = async () => {
      if (!doctorId) return;
      try {
        const token = await getAccessTokenSilently();
        const res = await api.get(`horarios/?doctor_id=${doctorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHorarios(res.data);
      } catch (err) {
        console.error("Error al obtener horarios:", err);
      }
    };
    fetchHorarios();
  }, [doctorId, getAccessTokenSilently]);

  // Agregar rango
  const handleAgregar = async (dia, inicio, fin) => {
    if (!doctorId) return;
    try {
      const token = await getAccessTokenSilently();
      const res = await api.post(
        "horarios/",
        {
          dia_semana: dia,
          hora_inicio: inicio,
          hora_fin: fin,
          doctor_id: doctorId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHorarios([...horarios, res.data]);
    } catch (err) {
      console.error("Error al agregar horario:", err.response?.data || err);
    }
  };

  // Eliminar
  const handleEliminar = async (id) => {
    try {
      const token = await getAccessTokenSilently();
      await api.delete(`horarios/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHorarios(horarios.filter((h) => h.id !== id));
    } catch (err) {
      console.error("Error al eliminar horario:", err);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Mi Horario de Disponibilidad</h2>

      {!doctorId && <p>🔄 Cargando doctor...</p>}

      {doctorId && (
        <div className="horario-grid">
          {diasSemana.map((dia, i) => (
            <div key={i} style={{ marginBottom: "1.5rem" }}>
              <h3>{dia}</h3>
              <ul>
                {horarios
                  .filter((h) => h.dia_semana === i)
                  .map((h) => (
                    <li key={h.id}>
                      {h.hora_inicio} – {h.hora_fin}
                      <button
                        onClick={() => handleEliminar(h.id)}
                        style={{ marginLeft: "1rem", color: "red" }}
                      >
                        ❌
                      </button>
                    </li>
                  ))}
              </ul>
              <AgregarRango onAdd={(ini, fin) => handleAgregar(i, ini, fin)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 🔹 Componente pequeño para añadir rangos
function AgregarRango({ onAdd }) {
  const [inicio, setInicio] = useState("");
  const [fin, setFin] = useState("");

  return (
    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
      <input
        type="time"
        value={inicio}
        onChange={(e) => setInicio(e.target.value)}
      />
      <input type="time" value={fin} onChange={(e) => setFin(e.target.value)} />
      <button
        onClick={() => {
          if (inicio && fin) {
            onAdd(inicio, fin);
            setInicio("");
            setFin("");
          }
        }}
      >
        ➕
      </button>
    </div>
  );
}
