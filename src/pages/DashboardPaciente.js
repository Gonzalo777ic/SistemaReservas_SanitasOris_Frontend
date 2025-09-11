// src/pages/DashboardPaciente.js

import { useAuth0 } from "@auth0/auth0-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import AppointmentCalendar from "../components/paciente/AppointmentCalendar"; // New Component
import CancelAppointmentModal from "../components/paciente/CancelAppointmentModal"; // New Component
import { api } from "../services/api";
import "./styles.css";

export default function DashboardPaciente() {
  const { user, getAccessTokenSilently } = useAuth0();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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
    if (location.state?.bookingSuccess) {
      setShowSuccessMessage(true);
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
        navigate(location.pathname, { replace: true, state: {} });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [fetchPatientAppointments, location, navigate]);

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

  return (
    <div className="d-flex vh-100 bg-light font-sans">
      <Sidebar userRole="paciente" />
      <main className="flex-grow-1 p-3 overflow-auto">
        <h1 className="h4 fw-bold text-dark">
          Bienvenido, {user?.name || "Paciente"} 👋
        </h1>
        <p className="text-secondary">
          Aquí puedes ver un resumen de tus citas.
        </p>

        {showSuccessMessage && (
          <div className="alert alert-success mt-3" role="alert">
            Reserva hecha con éxito 🎉
          </div>
        )}

        {loading ? (
          <div className="text-center">Cargando tus citas...</div>
        ) : error ? (
          <div className="text-center text-danger">{error}</div>
        ) : (
          <AppointmentCalendar
            appointments={appointments}
            handleShowCancelModal={handleShowCancelModal}
            navigate={navigate}
          />
        )}
      </main>
      <CancelAppointmentModal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        appointmentToCancel={appointmentToCancel}
        handleCancelAppointment={handleCancelAppointment}
      />
    </div>
  );
}
