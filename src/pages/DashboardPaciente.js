import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function DashboardPaciente() {
  const { user, getAccessTokenSilently } = useAuth0();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await api.get("reservas/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setCitas(res.data || []);
      } catch (err) {
        console.error("Error cargando citas:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCitas();
  }, [getAccessTokenSilently]);

  const handleCancelar = async (id) => {
    try {
      const token = await getAccessTokenSilently();
      await api.delete(`reservas/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCitas((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error cancelando cita:", err);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "2rem",
        }}
      >
        <h2>Bienvenido, {user?.name || "Paciente"}</h2>
      </div>

      <h3>Próximas citas</h3>
      {loading ? (
        <p>Cargando citas...</p>
      ) : citas.length === 0 ? (
        <p>No tienes citas programadas.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {citas.map((cita) => {
            const fecha = new Date(cita.fecha_hora);
            return (
              <li
                key={cita.id}
                style={{
                  marginBottom: "1rem",
                  padding: "1rem",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                }}
              >
                <p>
                  <strong>Fecha:</strong> {fecha.toLocaleDateString()} -{" "}
                  {fecha.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p>
                  <strong>Doctor:</strong>{" "}
                  {cita.doctor?.user?.name || cita.doctor?.user?.email || "N/A"}
                </p>
                <p>
                  <strong>Procedimiento:</strong> {cita.procedimiento || "N/A"}
                </p>
                <button
                  onClick={() => handleCancelar(cita.id)}
                  style={{
                    backgroundColor: "#c0392b",
                    color: "white",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Cancelar cita
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div style={{ marginTop: "2rem" }}>
        <button
          onClick={() => navigate("/reservar")}
          style={{
            backgroundColor: "#27ae60",
            color: "white",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Reservar nueva cita
        </button>
      </div>
    </div>
  );
}
