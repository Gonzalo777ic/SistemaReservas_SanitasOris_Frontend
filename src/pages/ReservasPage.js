import { format, getDay, parse, parseISO, startOfWeek } from "date-fns";
import enUS from "date-fns/locale/en-US";
import { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { getReservas } from "../services/reservas";

import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";

import { crearReserva } from "../services/reservas";

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
  return {
    style: {
      backgroundColor: "#28a745",
      color: "white",
      borderRadius: "4px",
      border: "none",
      display: "block",
      height: "50px", // forzar altura mínima
    },
  };
};

const ReservasPage = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState(Views.WEEK);
  const [date, setDate] = useState(new Date()); // <-- nuevo estado
  const [nuevaReserva, setNuevaReserva] = useState(null);
  const [guardando, setGuardando] = useState(false);

  const handleAddReserva = () => {
    const reserva = {
      paciente: { nombre: "Paciente Demo" },
      doctor: { nombre: "Doctor Demo" },
      fecha_hora: new Date().toISOString(),
      estado: "pendiente",
    };
    setNuevaReserva(reserva);
  };

  const handleGuardarReserva = async () => {
    setGuardando(true);
    try {
      const token = localStorage.getItem("token"); // 👈 asegúrate de guardar el token al login
      const reservaGuardada = await crearReserva(nuevaReserva, token);
      setReservas((prev) => [...prev, reservaGuardada]);
      setNuevaReserva(null);
    } catch (error) {
      alert("Error al guardar la reserva");
    } finally {
      setGuardando(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    getReservas()
      .then((data) => {
        setReservas(data);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError("Error al obtener reservas");
      })
      .finally(() => setLoading(false));
  }, []);

  const eventos = [
    ...reservas.map((r) => {
      const start = parseISO(r.fecha_hora);
      const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hora
      return {
        id: r.id,
        title: `${r.paciente.nombre} con ${r.doctor.nombre}`,
        start,
        end,
      };
    }),
    ...(nuevaReserva
      ? [
          {
            id: "nueva", // id temporal
            title: `${nuevaReserva.paciente.nombre} con ${nuevaReserva.doctor.nombre}`,
            start: parseISO(nuevaReserva.fecha_hora),
            end: new Date(
              new Date(nuevaReserva.fecha_hora).getTime() + 60 * 60 * 1000
            ),
            isProvisional: true,
          },
        ]
      : []),
  ];

  const handleEventDrop = ({ event, start, end }) => {
    if (event.id === "nueva") {
      setNuevaReserva((prev) => ({
        ...prev,
        fecha_hora: start.toISOString(),
      }));
    } else {
      setReservas((prev) =>
        prev.map((r) =>
          r.id === event.id ? { ...r, fecha_hora: start.toISOString() } : r
        )
      );
    }
    console.log("Evento movido", event, start, end);
  };

  // Handler para navegación (hoy, atrás, adelante)
  const handleNavigate = (newDate) => {
    setDate(newDate);
  };

  const CalendarComponent =
    currentView === Views.WEEK || currentView === Views.DAY
      ? DragAndDropCalendar
      : Calendar;

  return (
    <div className="reservas-page">
      <h1>Mis Reservas</h1>
      {currentView === Views.WEEK && !nuevaReserva && (
        <button onClick={handleAddReserva} style={{ marginBottom: "20px" }}>
          Agregar Reserva
        </button>
      )}
      {nuevaReserva && (
        <div style={{ marginBottom: "20px" }}>
          <span>
            Reserva nueva: {nuevaReserva.paciente.nombre} con{" "}
            {nuevaReserva.doctor.nombre}
          </span>
          <button
            onClick={handleGuardarReserva}
            disabled={guardando}
            style={{ marginLeft: "10px" }}
          >
            {guardando ? "Guardando..." : "Reservar"}
          </button>
          <button
            onClick={() => setNuevaReserva(null)}
            style={{ marginLeft: "10px" }}
          >
            Cancelar
          </button>
          <p style={{ marginTop: "10px", color: "#888" }}>
            Puedes mover la reserva en el calendario antes de guardar.
          </p>
        </div>
      )}
      {loading && <p>Cargando reservas...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {!loading && !error && (
        <CalendarComponent
          localizer={localizer}
          events={eventos}
          startAccessor="start"
          endAccessor="end"
          views={{ month: true, week: true, day: true, agenda: true }}
          defaultView={Views.WEEK}
          view={currentView}
          onView={setCurrentView}
          date={date}
          onNavigate={handleNavigate}
          style={{ height: 600, margin: "50px" }}
          draggableAccessor={() => true}
          resizable
          onEventDrop={handleEventDrop}
          onEventResize={(e) => console.log("Evento redimensionado", e)}
          eventPropGetter={eventStyleGetter}
        />
      )}
    </div>
  );
};
export default ReservasPage;
