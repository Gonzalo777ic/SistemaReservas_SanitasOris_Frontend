import { useNavigate } from "react-router-dom";

export default function DashboardDoctor() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Bienvenido Doctor</h1>
      <p>Seleccione una acción para comenzar:</p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginTop: "1rem",
        }}
      >
        <button
          onClick={() => navigate("/reservas")}
          style={{
            padding: "1rem 2rem",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Ver y gestionar reservas
        </button>

        <button
          onClick={() => navigate("/horario")}
          style={{
            padding: "1rem 2rem",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          Configurar mi horario
        </button>
      </div>
    </div>
  );
}
