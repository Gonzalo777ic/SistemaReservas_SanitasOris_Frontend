import { useNavigate } from "react-router-dom";

export default function DashboardDoctor() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Bienvenido Doctor</h1>
      <p>Seleccione una acción para comenzar:</p>
      <button
        onClick={() => navigate("/reservas")}
        style={{
          padding: "1rem 2rem",
          fontSize: "1rem",
          cursor: "pointer",
          marginTop: "1rem",
        }}
      >
        Ver y gestionar reservas
      </button>
    </div>
  );
}
