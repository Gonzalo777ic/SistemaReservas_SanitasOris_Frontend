// src/pages/DashboardPaciente.js
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DashboardPaciente() {
  const { user, logout, getAccessTokenSilently } = useAuth0();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔹 Registrar usuario en backend al iniciar sesión
  useEffect(() => {
    const registrarUsuario = async () => {
      try {
        const token = await getAccessTokenSilently();

        await fetch("http://localhost:8000/api/sync-user/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: user?.email,
            nombre: user?.name || "Paciente",
          }),
        });
      } catch (error) {
        console.error("Error registrando usuario:", error);
      }
    };

    if (user) {
      registrarUsuario();
    }
  }, [user, getAccessTokenSilently]);

  // 🔹 Obtener citas desde el backend
  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const token = await getAccessTokenSilently();

        const response = await fetch("http://localhost:8000/api/reservas/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Error al obtener citas");
        }

        const data = await response.json();
        setCitas(data); // data debería ser un array de citas
      } catch (error) {
        console.error("Error cargando citas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCitas();
  }, [getAccessTokenSilently]);

  const handleCancelar = async (id) => {
    try {
      const token = await getAccessTokenSilently();

      const response = await fetch(
        `http://localhost:8000/api/reservas/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) throw new Error("Error al cancelar la cita");

      setCitas((prev) => prev.filter((c) => c.id !== id));
    } catch (error) {
      console.error("Error cancelando cita:", error);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      {/* Header con logout */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "2rem",
        }}
      >
        <h2>Bienvenido, {user?.name || "Paciente"}</h2>
        <button
          onClick={() => logout({ returnTo: window.location.origin })}
          style={{
            backgroundColor: "#e74c3c",
            color: "white",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Cerrar sesión
        </button>
      </div>

      {/* Próximas citas */}
      <h3>Próximas citas</h3>
      {loading ? (
        <p>Cargando citas...</p>
      ) : citas.length === 0 ? (
        <p>No tienes citas programadas.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {citas.map((cita) => (
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
                <strong>Fecha:</strong> {cita.fecha} - {cita.hora}
              </p>
              <p>
                <strong>Doctor:</strong> {cita.doctor}
              </p>
              <p>
                <strong>Procedimiento:</strong> {cita.procedimiento}
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
          ))}
        </ul>
      )}

      {/* Botón reservar */}
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
