import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function HorarioDoctorPage() {
  const { user, getAccessTokenSilently } = useAuth0();
  const [doctorId, setDoctorId] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [nuevoHorario, setNuevoHorario] = useState({
    dia_semana: 0,
    hora_inicio: "",
    hora_fin: "",
  });

  const diasSemana = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  // 🔹 1. Obtener ID del doctor según el usuario logueado
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

        if (doctor) {
          setDoctorId(doctor.id);
        } else {
          console.error("❌ No se encontró doctor asociado a este usuario");
        }
      } catch (err) {
        console.error("Error al obtener doctor:", err);
      }
    };

    fetchDoctorId();
  }, [getAccessTokenSilently, user.email]);

  // 🔹 2. Cargar horarios del doctor
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

  // 🔹 3. Guardar nuevo horario
  const handleAgregar = async (e) => {
    e.preventDefault();
    if (!doctorId) return;

    try {
      const token = await getAccessTokenSilently();
      const res = await api.post(
        "horarios/",
        { ...nuevoHorario, doctor_id: doctorId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setHorarios([...horarios, res.data]);
      setNuevoHorario({ dia_semana: 0, hora_inicio: "", hora_fin: "" });
    } catch (err) {
      console.error("Error al agregar horario:", err.response?.data || err);
    }
  };

  // 🔹 4. Eliminar horario
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

      {!doctorId && <p>🔄 Buscando doctor asociado a tu cuenta...</p>}

      {doctorId && (
        <>
          <form onSubmit={handleAgregar} style={{ marginBottom: "1rem" }}>
            <select
              value={nuevoHorario.dia_semana}
              onChange={(e) =>
                setNuevoHorario({
                  ...nuevoHorario,
                  dia_semana: parseInt(e.target.value),
                })
              }
              required
            >
              {diasSemana.map((d, i) => (
                <option key={i} value={i}>
                  {d}
                </option>
              ))}
            </select>
            <input
              type="time"
              value={nuevoHorario.hora_inicio}
              onChange={(e) =>
                setNuevoHorario({
                  ...nuevoHorario,
                  hora_inicio: e.target.value,
                })
              }
              required
            />
            <input
              type="time"
              value={nuevoHorario.hora_fin}
              onChange={(e) =>
                setNuevoHorario({ ...nuevoHorario, hora_fin: e.target.value })
              }
              required
            />
            <button type="submit">Agregar</button>
          </form>

          <ul>
            {horarios.map((h) => (
              <li key={h.id}>
                {diasSemana[h.dia_semana]}: {h.hora_inicio} - {h.hora_fin}
                <button
                  onClick={() => handleEliminar(h.id)}
                  style={{ marginLeft: "1rem", color: "red" }}
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
