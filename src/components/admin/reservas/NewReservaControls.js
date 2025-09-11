// src/components/reservas/NewReservaControls.js

import { Views } from "react-big-calendar";

const NewReservaControls = ({
  nuevaReserva,
  guardando,
  onAddReserva,
  onSaveReserva,
  onCancelReserva,
  currentView,
}) => {
  if (nuevaReserva) {
    return (
      <div style={{ marginBottom: "20px" }}>
        <span>
          Reserva nueva: {nuevaReserva.paciente.nombre} con{" "}
          {nuevaReserva.doctor.nombre}
        </span>
        <button
          onClick={onSaveReserva}
          disabled={guardando}
          style={{ marginLeft: "10px" }}
        >
          {guardando ? "Guardando..." : "Reservar"}
        </button>
        <button onClick={onCancelReserva} style={{ marginLeft: "10px" }}>
          Cancelar
        </button>
        <p style={{ marginTop: "10px", color: "#888" }}>
          Puedes mover la reserva en el calendario antes de guardar.
        </p>
      </div>
    );
  }

  // Solo mostrar el botón "Agregar Reserva" en la vista de semana
  if (currentView === Views.WEEK) {
    return (
      <button onClick={onAddReserva} style={{ marginBottom: "20px" }}>
        Agregar Reserva
      </button>
    );
  }

  return null;
};

export default NewReservaControls;
