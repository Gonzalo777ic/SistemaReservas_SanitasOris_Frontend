import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useEffect, useState } from "react";
import {
  Badge,
  Button,
  Container,
  Dropdown,
  DropdownButton,
  Spinner,
  Table,
} from "react-bootstrap";
import { MdCancel, MdCheckCircle } from "react-icons/md";
import Sidebar from "../components/Sidebar";

// Importa los estilos de Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";

export default function ReservasAdmin() {
  const { getAccessTokenSilently } = useAuth0();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("pendiente");

  const fetchReservas = useCallback(
    async (currentFilter) => {
      try {
        setLoading(true);
        setError(null);
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: process.env.REACT_APP_AUTH0_AUDIENCE,
          },
        });

        // URL corregida para usar el proxy de desarrollo
        const url = `/api/reservas/?estado=${currentFilter}`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setReservas(data);
      } catch (err) {
        console.error("❌ Error fetching reservas:", err);
        setError("No se pudo cargar la lista de reservas.");
      } finally {
        setLoading(false);
      }
    },
    [getAccessTokenSilently]
  );

  useEffect(() => {
    fetchReservas(filter);
  }, [fetchReservas, filter]);

  const handleUpdateStatus = async (reservaId, newStatus) => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        },
      });

      // URL corregida para usar el proxy de desarrollo
      const url = `/api/reservas/${reservaId}/`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      // Actualizar la lista después de un cambio exitoso
      fetchReservas(filter);
    } catch (err) {
      console.error(`❌ Error al actualizar el estado de la reserva:`, err);
      setError("No se pudo actualizar el estado de la reserva.");
    }
  };

  const getStatusBadge = (status) => {
    let variant;
    switch (status) {
      case "pendiente":
        variant = "warning";
        break;
      case "confirmada":
        variant = "success";
        break;
      case "cancelada":
        variant = "danger";
        break;
      default:
        variant = "secondary";
    }
    return (
      <Badge bg={variant}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPatientName = (reserva) => {
    if (reserva.paciente && reserva.paciente.user) {
      return (
        `${reserva.paciente.user.first_name || ""} ${
          reserva.paciente.user.last_name || ""
        }`.trim() || reserva.paciente.user.email
      );
    }
    return "Paciente desconocido";
  };

  const getDoctorName = (reserva) => {
    if (reserva.doctor && reserva.doctor.user) {
      return (
        `${reserva.doctor.user.first_name || ""} ${
          reserva.doctor.user.last_name || ""
        }`.trim() || reserva.doctor.user.email
      );
    }
    return "Doctor desconocido";
  };

  return (
    <div className="d-flex vh-100 bg-light">
      <Sidebar userRole="admin" />

      <main className="flex-grow-1 p-3 overflow-auto">
        <Container fluid>
          <div className="mb-4">
            <h1 className="h4 fw-bold text-dark">Gestión de Reservas</h1>
            <p className="text-secondary">
              Lista y control de todas las reservas de citas.
            </p>
          </div>

          <div className="card shadow-sm p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h6 fw-bold m-0">Lista de Reservas</h2>
              <DropdownButton
                title={`Filtrar por: ${
                  filter.charAt(0).toUpperCase() + filter.slice(1)
                }`}
                variant="outline-secondary"
              >
                <Dropdown.Item onClick={() => setFilter("pendiente")}>
                  Pendiente
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setFilter("confirmada")}>
                  Confirmada
                </Dropdown.Item>
                <Dropdown.Item onClick={() => setFilter("cancelada")}>
                  Cancelada
                </Dropdown.Item>
              </DropdownButton>
            </div>

            {loading ? (
              <div className="d-flex justify-content-center my-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </Spinner>
              </div>
            ) : error ? (
              <div className="alert alert-danger text-center">{error}</div>
            ) : (
              <Table striped bordered hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Paciente</th>
                    <th>Doctor</th>
                    <th>Procedimiento</th>
                    <th>Fecha y Hora</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reservas.length > 0 ? (
                    reservas.map((reserva) => (
                      <tr key={reserva.id}>
                        <td>{reserva.id}</td>
                        <td>{getPatientName(reserva)}</td>
                        <td>{getDoctorName(reserva)}</td>
                        <td>{reserva.procedimiento_nombre || "N/A"}</td>
                        <td>{new Date(reserva.fecha_hora).toLocaleString()}</td>
                        <td>{getStatusBadge(reserva.estado)}</td>
                        <td>
                          {reserva.estado === "pendiente" && (
                            <div className="d-flex gap-2">
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() =>
                                  handleUpdateStatus(reserva.id, "confirmada")
                                }
                                title="Aprobar"
                              >
                                <MdCheckCircle />
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() =>
                                  handleUpdateStatus(reserva.id, "cancelada")
                                }
                                title="Cancelar"
                              >
                                <MdCancel />
                              </Button>
                            </div>
                          )}
                          {reserva.estado === "confirmada" && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() =>
                                handleUpdateStatus(reserva.id, "cancelada")
                              }
                              title="Cancelar"
                            >
                              <MdCancel />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center text-secondary">
                        No se encontraron reservas con el filtro actual.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </div>
        </Container>
      </main>
    </div>
  );
}
