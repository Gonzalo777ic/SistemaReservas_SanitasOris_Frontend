// src/components/reservas/ProcedimientosCarousel.js DUMMY
import { useState } from "react";

const procedimientosMock = [
  { id: 1, nombre: "Consulta general", duracion: 30, img: "/img/consulta.png" },
  { id: 2, nombre: "Limpieza dental", duracion: 40, img: "/img/limpieza.png" },
  { id: 3, nombre: "Curación de caries", duracion: 60, img: "/img/caries.png" },
];

export default function ProcedimientosCarousel({ onSelect }) {
  const [seleccionado, setSeleccionado] = useState(null);

  const handleSelect = (proc) => {
    setSeleccionado(proc.id);
    onSelect(proc); // se pasa al padre
  };

  return (
    <div>
      <h3>Selecciona un procedimiento</h3>
      <div style={{ display: "flex", gap: "1rem", overflowX: "auto" }}>
        {procedimientosMock.map((proc) => (
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
            <img src={proc.img} alt={proc.nombre} width="100" />
            <p>{proc.nombre}</p>
            <small>{proc.duracion} min</small>
          </div>
        ))}
      </div>
    </div>
  );
}
