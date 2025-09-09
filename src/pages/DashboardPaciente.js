// src/pages/DashboardPaciente.js

import { useAuth0 } from "@auth0/auth0-react";
import "bootstrap/dist/css/bootstrap.min.css";
import format from "date-fns/format";
import getDay from "date-fns/getDay";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import { useCallback, useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/sass/styles.scss";
import { Card, Button, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar"; // Importa el Sidebar correctamente
import { api } from "../services/api";
import "./styles.css";

// Configuración de locales para date-fns
import { es } from "date-fns/locale";
const locales = { "es-ES": es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { locale: es, weekStartsOn: 1 }),
  getDay,
  locales,
});

// Definición de colores de eventos
const eventColors = {
  confirmada: "rgb(0, 123, 255)",
  pendiente: "rgb(255, 193, 7)",
  cancelada: "rgb(220, 53, 69)",
};

export default function DashboardPaciente() {
  const { user, getAccessTokenSilently } = useAuth0();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);

  const fetchPatientAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });
      const response = await api.get("reservas/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      const adaptedAppointments = data.map((reserva) => ({
        id: reserva.id,
        title: `${reserva.procedimiento?.nombre || "N/A"}`,
        start: new Date(reserva.fecha_hora),
        end: new Date(
          new Date(reserva.fecha_hora).getTime() + reserva.duracion_min * 60000
        ),
        estado: reserva.estado,
        reserva: reserva,
      }));
      setAppointments(adaptedAppointments);
      setLoading(false);
    } catch (err) {
      console.error(
        "Error fetching patient appointments:",
        err.response?.data || err
      );
      setError("Error al cargar las citas. Intenta de nuevo.");
      setLoading(false);
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    fetchPatientAppointments();
  }, [fetchPatientAppointments]);

  const handleShowCancelModal = (appointment) => {
    setAppointmentToCancel(appointment);
    setShowCancelModal(true);
  };

  const handleCancelAppointment = async () => {
    if (!appointmentToCancel) return;
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });
      await api.patch(
        `reservas/${appointmentToCancel.id}/`,
        { estado: "cancelada" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments((prev) =>
        prev.map((c) =>
          c.id === appointmentToCancel.id ? { ...c, estado: "cancelada" } : c
        )
      );
      setShowCancelModal(false);
    } catch (err) {
      console.error("Error cancelando cita:", err);
    }
  };

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

  const patientName = user?.name || "Paciente";

  return (
    <div className="d-flex vh-100 bg-light font-sans">
      {/* 🟢 El cambio está aquí. Le pasamos explícitamente el rol al Sidebar. */}
      <Sidebar userRole="patient" />
      <main className="flex-grow-1 p-3 overflow-auto">
        <h1 className="h4 fw-bold text-dark">Bienvenido, {patientName} 👋</h1>
        <p className="text-secondary">
          Aquí puedes ver un resumen de tus citas.
        </p>
        {loading ? (
          <div className="text-center">Cargando tus citas...</div>
        ) : error ? (
          <div className="text-center text-danger">{error}</div>
        ) : (
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
        )}
      </main>
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancelar Cita</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {appointmentToCancel && (
            <p>
              ¿Estás seguro de que deseas cancelar la cita del{" "}
              <strong>
                {format(appointmentToCancel.start, "dd MMM yyyy", {
                  locale: es,
                })}
              </strong>{" "}
              a las{" "}
              <strong>
                {format(appointmentToCancel.start, "HH:mm", { locale: es })}
              </strong>
              ?
            </p>
          )}
          <p className="text-muted small">Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Cerrar
          </Button>
          <Button variant="danger" onClick={handleCancelAppointment}>
            Cancelar Cita
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
