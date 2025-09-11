// src/components/paciente/AppointmentCalendar.js

import format from "date-fns/format";
import getDay from "date-fns/getDay";
import { es } from "date-fns/locale";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import { useCallback } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/sass/styles.scss";
import { Button } from "react-bootstrap";

const locales = { "es-ES": es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { locale: es, weekStartsOn: 1 }),
  getDay,
  locales,
});

const eventColors = {
  confirmada: "rgb(0, 123, 255)",
  pendiente: "rgb(255, 193, 7)",
  cancelada: "rgb(220, 53, 69)",
};

const AppointmentCalendar = ({
  appointments,
  handleShowCancelModal,
  navigate,
}) => {
  const getStatusColor = useCallback(
    (estado) => eventColors[estado] || "gray",
    []
  );

  const eventPropGetter = useCallback(
    (event) => ({
      style: {
        backgroundColor: getStatusColor(event.estado),
        borderRadius: "5px",
        opacity: 0.8,
        color: "white",
        border: `1px solid ${getStatusColor(event.estado)}`,
      },
    }),
    [getStatusColor]
  );

  const handleSelectEvent = (event) => {
    if (event.estado === "pendiente" || event.estado === "confirmada") {
      handleShowCancelModal(event);
    }
  };

  return (
    <div className="card shadow-sm p-4 mt-4">
      <h5 className="card-title fw-semibold text-primary mb-3">
        Calendario de Citas
      </h5>
      <Calendar
        localizer={localizer}
        events={appointments}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        views={["week", "month", "day"]}
        defaultView="week"
        eventPropGetter={eventPropGetter}
        onSelectEvent={handleSelectEvent}
      />
      <div className="d-flex justify-content-center mt-4">
        <Button onClick={() => navigate("/reservar")} variant="primary">
          Reservar nueva cita
        </Button>
      </div>
    </div>
  );
};

export default AppointmentCalendar;
