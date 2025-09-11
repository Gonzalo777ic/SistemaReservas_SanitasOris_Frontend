// src/components/doctor/DoctorCalendar.js

import format from "date-fns/format";
import getDay from "date-fns/getDay";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/sass/styles.scss";

// Configuración de locales para date-fns
import { es } from "date-fns/locale";
const locales = { "es-ES": es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DoctorCalendar = ({ appointments }) => {
  return (
    <Calendar
      localizer={localizer}
      events={appointments}
      startAccessor="start"
      endAccessor="end"
      style={{ height: 600 }}
      views={["week", "day"]}
      defaultView="week"
    />
  );
};

export default DoctorCalendar;
