// src/components/doctor/horarios/HorarioCalendar.js

import { addDays, format, getDay, parse, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button } from "react-bootstrap";
import { MdAddCircle } from "react-icons/md";

// Configuración de locales para date-fns
const locales = { "es-ES": es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { locale: es, weekStartsOn: 1 }), // Lunes
  getDay,
  locales,
});

const HorarioCalendar = ({
  horarios,
  onSelectSlot,
  onSelectEvent,
  onAddHorarioClick,
}) => {
  // Filtrar los horarios para que el calendario solo muestre los que están activos
  const calendarEvents = horarios
    .filter((h) => h.activo)
    .map((h) => {
      const today = new Date();
      const startOfWeekDay = startOfWeek(today, {
        locale: es,
        weekStartsOn: 1,
      });
      const eventDay = addDays(startOfWeekDay, h.dia_semana);
      const [startHour, startMinute] = h.hora_inicio.split(":").map(Number);
      const [endHour, endMinute] = h.hora_fin.split(":").map(Number);

      const start = new Date(
        eventDay.getFullYear(),
        eventDay.getMonth(),
        eventDay.getDate(),
        startHour,
        startMinute
      );
      const end = new Date(
        eventDay.getFullYear(),
        eventDay.getMonth(),
        eventDay.getDate(),
        endHour,
        endMinute
      );

      return {
        title: `${h.hora_inicio} - ${h.hora_fin}`,
        start: start,
        end: end,
        resourceId: h.id, // Usamos resourceId para mapear de vuelta al horario original
      };
    });

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="card-title fw-semibold text-primary">Vista Semanal</h5>
        <Button variant="outline-primary" onClick={() => onAddHorarioClick()}>
          <MdAddCircle className="me-2" />
          Añadir Horario
        </Button>
      </div>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        selectable
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        style={{ height: 600 }}
        views={["week", "day"]}
        defaultView="week"
      />
    </>
  );
};

export default HorarioCalendar;
