// src/pages/ReservasPage.js

import { useEffect, useState } from "react";
import { Views } from "react-big-calendar";
import NewReservaControls from "../components/reservas/NewReservaControls"; // Nuevo
import ReservasCalendar from "../components/reservas/ReservasCalendar"; // Nuevo
import { crearReserva, getReservas } from "../services/reservas";

const ReservasPage = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [nuevaReserva, setNuevaReserva] = useState(null);
  const [guardando, setGuardando] = useState(false);

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
      // Nota: El token debe obtenerse de forma segura, no de localStorage directamente.
      // Esto es solo un ejemplo simplificado.
      const token = localStorage.getItem("token");
      const reservaGuardada = await crearReserva(nuevaReserva, token);
      setReservas((prev) => [...prev, reservaGuardada]);
      setNuevaReserva(null);
    } catch (error) {
      alert("Error al guardar la reserva");
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelReserva = () => {
    setNuevaReserva(null);
  };

  const handleEventDrop = ({ event, start }) => {
    if (event.isProvisional) {
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
  };

  const eventos = [
    ...reservas.map((r) => {
      const start = new Date(r.fecha_hora);
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
            id: "nueva",
            title: `${nuevaReserva.paciente.nombre} con ${nuevaReserva.doctor.nombre}`,
            start: new Date(nuevaReserva.fecha_hora),
            end: new Date(
              new Date(nuevaReserva.fecha_hora).getTime() + 60 * 60 * 1000
            ),
            isProvisional: true,
          },
        ]
      : []),
  ];

  return (
    <div className="reservas-page" style={{ padding: "2rem" }}>
      <h1>Mis Reservas</h1>
      <NewReservaControls
        nuevaReserva={nuevaReserva}
        guardando={guardando}
        onAddReserva={handleAddReserva}
        onSaveReserva={handleGuardarReserva}
        onCancelReserva={handleCancelReserva}
        currentView={currentView}
      />
      {loading ? (
        <p>Cargando reservas...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <ReservasCalendar
          events={eventos}
          view={currentView}
          onView={setCurrentView}
          date={date}
          onNavigate={setDate}
          onEventDrop={handleEventDrop}
        />
      )}
    </div>
  );
};

export default ReservasPage;
