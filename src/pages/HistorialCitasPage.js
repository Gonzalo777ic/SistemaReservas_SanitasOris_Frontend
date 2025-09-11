// src/pages/HistorialCitasPage.js

import { useAuth0 } from "@auth0/auth0-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useCallback, useEffect, useState } from "react";
import { Badge, Card, ListGroup, Spinner } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
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

      // Filter appointments to show only past ones
      const pastAppointments = response.data.filter(
        (reserva) => new Date(reserva.fecha_hora) < new Date()
      );

      setAppointments(pastAppointments);
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

  const getStatusBadge = (estado) => {
    switch (estado) {
      case "confirmada":
        return <Badge bg="success">Confirmada</Badge>;
      case "pendiente":
        return (
          <Badge bg="warning" className="text-dark">
            Pendiente
          </Badge>
        );
      case "cancelada":
        return <Badge bg="danger">Cancelada</Badge>;
      case "completada":
        return <Badge bg="primary">Completada</Badge>;
      default:
        return <Badge bg="secondary">{estado}</Badge>;
    }
  };

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
          <div className="mt-4">
            <ListGroup>
              {appointments.map((cita) => (
                <ListGroup.Item
                  key={cita.id}
                  className="shadow-sm rounded-3 mb-3"
                >
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <h5 className="mb-0 fw-bold text-dark">
                      Cita con Dr(a). {cita.doctor?.nombre || "N/A"}
                    </h5>
                    {getStatusBadge(cita.estado)}
                  </div>
                  <p className="mb-1 text-secondary">
                    <small>
                      <strong>Fecha y Hora:</strong>{" "}
                      {format(new Date(cita.fecha_hora), "dd MMMM yyyy HH:mm", {
                        locale: es,
                      })}
                    </small>
                  </p>
                  <p className="mb-1 text-secondary">
                    <small>
                      <strong>Procedimiento:</strong>{" "}
                      {cita.procedimiento?.nombre || "N/A"}
                    </small>
                  </p>
                  <Card className="mt-3 bg-light border-0">
                    <Card.Body className="p-3">
                      <h6 className="fw-semibold text-primary mb-2">
                        Notas del Doctor:
                      </h6>
                      <p className="mb-0 text-muted small">
                        {cita.notas_doctor || "No hay notas para esta cita."}
                      </p>
                    </Card.Body>
                  </Card>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        )}
      </main>
    </div>
  );
}
