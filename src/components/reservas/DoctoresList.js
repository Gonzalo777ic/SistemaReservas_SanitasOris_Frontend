export default function DoctoresList({ doctores, onSelect }) {
  if (!doctores || doctores.length === 0) {
    return <p>No hay doctores disponibles.</p>;
  }

  return (
    <div>
      <h3>Selecciona un doctor</h3>
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        {doctores.map((doc) => (
          <div
            key={doc.id}
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              borderRadius: "10px",
              minWidth: "200px",
            }}
          >
            <p>
              <strong>
                {doc.nombre} {doc.apellido}
              </strong>
            </p>
            <p>Especialidad: {doc.especialidad}</p>
            <button
              onClick={() => onSelect(doc)}
              style={{
                marginTop: "0.5rem",
                backgroundColor: "#2980b9",
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Seleccionar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
