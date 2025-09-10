// src/components/reservas/ProcedimientosCarousel.js DUMMY
import { useState } from "react";

export default function ProcedimientosCarousel({ procedimientos, onSelect }) {
  const [seleccionado, setSeleccionado] = useState(null);

  const handleSelect = (proc) => {
    setSeleccionado(proc.id);
    onSelect(proc); // se pasa al padre
  };

  // 👈 Manejar el caso de que no haya procedimientos
  if (!procedimientos || procedimientos.length === 0) {
    return <p>No hay procedimientos disponibles.</p>;
  }

  return (
    <div>
      <h3>Selecciona un procedimiento</h3>
      <div style={{ display: "flex", gap: "1rem", overflowX: "auto" }}>
        {/* 👈 Usar la prop 'procedimientos' para renderizar */}
        {procedimientos.map((proc) => (
          <div
            key={proc.id}
            onClick={() => handleSelect(proc)}
            style={{
              minWidth: "150px",
              padding: "1rem",
              border:
                seleccionado === proc.id
                  ? "3px solid #27ae60"
                  : "1px solid #ccc",
              borderRadius: "10px",
              cursor: "pointer",
              textAlign: "center",
            }}
          >
            {/* Puedes usar una imagen por defecto o un icono si proc.img no existe */}
            <img
              src={proc.img || "/img/default.png"}
              alt={proc.nombre}
              width="100"
            />
            <p>{proc.nombre}</p>
            <small>{proc.duracion_min} min</small>
          </div>
        ))}
      </div>
    </div>
  );
}
