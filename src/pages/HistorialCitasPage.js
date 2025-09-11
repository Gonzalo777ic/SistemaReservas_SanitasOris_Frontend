// src/pages/HistorialCitasPage.js

import { useAuth0 } from "@auth0/auth0-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useCallback, useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import AppointmentList from "../components/paciente/historial/AppointmentList";
import { api } from "../services/api";
import "./styles.css";

export default function HistorialCitasPage() {
  const { user, getAccessTokenSilently } = useAuth0();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPatientAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });
      const response = await api.get("reservas/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Filter appointments for the current user and only show past ones
      const patientAppointments = response.data.filter(
        (reserva) =>
          reserva.paciente.user.email === user.email &&
          new Date(reserva.fecha_hora) < new Date()
      );

      setAppointments(patientAppointments);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching patient appointments:", err);
      setError(
        "Error al cargar el historial de citas. Por favor, intenta de nuevo."
      );
      setLoading(false);
    }
  }, [getAccessTokenSilently, user]);

  useEffect(() => {
    fetchPatientAppointments();
  }, [fetchPatientAppointments]);

  return (
    <div className="d-flex vh-100 bg-light font-sans">
      <Sidebar userRole="paciente" />
      <main className="flex-grow-1 p-3 overflow-auto">
        <h1 className="h4 fw-bold text-dark">Historial de Citas</h1>
        <p className="text-secondary">
          Aquí puedes ver un registro de tus citas pasadas y las notas del
          doctor.
        </p>

        {loading ? (
          <div className="d-flex justify-content-center mt-5">
            <Spinner
              animation="border"
              role="status"
              className="me-2 text-primary"
            />
            <span className="text-primary">Cargando tu historial...</span>
          </div>
        ) : error ? (
          <div className="text-center text-danger mt-5">{error}</div>
        ) : appointments.length === 0 ? (
          <div className="text-center mt-5 text-muted">
            <p>No tienes citas pasadas en tu historial.</p>
          </div>
        ) : (
          <AppointmentList appointments={appointments} />
        )}
      </main>
    </div>
  );
}
