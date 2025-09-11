// src/components/reservas/ReservasCalendar.js

import { format, getDay, parse, startOfWeek } from "date-fns";
import enUS from "date-fns/locale/en-US";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

const DragAndDropCalendar = withDragAndDrop(Calendar);

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const eventStyleGetter = (event) => {
  const backgroundColor = event.isProvisional ? "#FFC107" : "#28a745";
  return {
    style: {
      backgroundColor,
      color: event.isProvisional ? "black" : "white",
      borderRadius: "4px",
      border: "none",
      display: "block",
    },
  };
};

const ReservasCalendar = ({
  events,
  view,
  onView,
  date,
  onNavigate,
  onEventDrop,
}) => {
  return (
    <DragAndDropCalendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      views={{ month: true, week: true, day: true, agenda: true }}
      defaultView={view}
      view={view}
      onView={onView}
      date={date}
      onNavigate={onNavigate}
      style={{ height: 600, margin: "50px 0" }}
      draggableAccessor={() => true}
      resizable={false} // Desactivar redimensionar para simplificar
      onEventDrop={onEventDrop}
      eventPropGetter={eventStyleGetter}
    />
  );
};

export default ReservasCalendar;
