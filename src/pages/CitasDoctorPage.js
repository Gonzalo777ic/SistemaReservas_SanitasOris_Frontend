// src/pages/CitasDoctorPage.js

import { useAuth0 } from "@auth0/auth0-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useCallback, useEffect, useState } from "react";
import { Badge, Button, Card, Modal, Table } from "react-bootstrap";
import { MdCancel, MdCheckCircle, MdEditNote, MdInfo } from "react-icons/md"; // Add MdEditNote
import AddNotesModal from "../components/AddNotesModal"; // Import the new modal
import Sidebar from "../components/Sidebar";
import { api } from "../services/api";

export default function CitasDoctorPage() {
  const { getAccessTokenSilently } = useAuth0();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false); // New state for notes modal
  const [selectedReserva, setSelectedReserva] = useState(null);

  // Estados para los modales de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reservaToUpdate, setReservaToUpdate] = useState(null);
  const [newStatusToApply, setNewStatusToApply] = useState(null);

  const fetchReservas = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });
      const reservasRes = await api.get("reservas/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReservas(reservasRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar reservas:", err);
      setError("Error al cargar la lista de citas.");
      setLoading(false);
    }
  }, [getAccessTokenSilently]);

  const handleUpdateStatus = async () => {
    if (!reservaToUpdate || !newStatusToApply) return;
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });
      const updatedReserva = await api.patch(
        `reservas/${reservaToUpdate.id}/`,
        { estado: newStatusToApply },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReservas(
        reservas.map((reserva) =>
          reserva.id === reservaToUpdate.id ? updatedReserva.data : reserva
        )
      );
      setShowConfirmModal(false);
      setShowCancelModal(false);
    } catch (err) {
      console.error(
        "Error al actualizar el estado:",
        err.response?.data || err
      );
    }
  };

  const onNotesAdded = (updatedReserva) => {
    setReservas(
      reservas.map((r) => (r.id === updatedReserva.id ? updatedReserva : r))
    );
  };

  const getStatusBadge = (estado) => {
    switch (estado) {
      case "pendiente":
        return <Badge bg="warning">Pendiente</Badge>;
      case "confirmada":
        return <Badge bg="success">Confirmada</Badge>;
      case "cancelada":
        return <Badge bg="danger">Cancelada</Badge>;
      case "completada":
        return <Badge bg="primary">Completada</Badge>;
      default:
        return <Badge bg="secondary">{estado}</Badge>;
    }
  };

  const handleShowDetails = (reserva) => {
    setSelectedReserva(reserva);
    setShowDetailsModal(true);
  };

  const handleShowNotesModal = (reserva) => {
    setSelectedReserva(reserva);
    setShowNotesModal(true);
  };

  const handleShowConfirmModal = (reserva) => {
    setReservaToUpdate(reserva);
    setNewStatusToApply("confirmada");
    setShowConfirmModal(true);
  };

  const handleShowCancelModal = (reserva) => {
    setReservaToUpdate(reserva);
    setNewStatusToApply("cancelada");
    setShowCancelModal(true);
  };

  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  return (
    <div className="d-flex vh-100 bg-light font-sans">
      <Sidebar userRole="doctor" />
      <main className="flex-grow-1 p-3 overflow-auto">
        <h2 className="text-secondary fw-bold mb-4">Gestión de Citas</h2>
        <Card className="shadow-sm">
          <Card.Body>
            <h5 className="card-title fw-semibold text-primary mb-3">
              Próximas y Pasadas Citas
            </h5>
            {loading ? (
              <div className="text-center">Cargando citas...</div>
            ) : error ? (
              <div className="text-center text-danger">{error}</div>
            ) : (
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>Fecha y Hora</th>
                    <th>Paciente</th>
                    <th>Procedimiento</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reservas.length > 0 ? (
                    reservas.map((reserva) => (
                      <tr key={reserva.id}>
                        <td>
                          {format(
                            new Date(reserva.fecha_hora),
                            "dd MMM yyyy HH:mm",
                            { locale: es }
                          )}
                        </td>
                        <td>
                          {reserva.paciente?.user?.first_name}{" "}
                          {reserva.paciente?.user?.last_name}
                        </td>
                        <td>{reserva.procedimiento?.nombre || "N/A"}</td>
                        <td>{getStatusBadge(reserva.estado)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            {reserva.estado === "pendiente" && (
                              <>
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() =>
                                    handleShowConfirmModal(reserva)
                                  }
                                >
                                  <MdCheckCircle />
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleShowCancelModal(reserva)}
                                >
                                  <MdCancel />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="info"
                              size="sm"
                              onClick={() => handleShowDetails(reserva)}
                            >
                              <MdInfo />
                            </Button>
                            {/* New button for notes */}
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleShowNotesModal(reserva)}
                            >
                              <MdEditNote />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        No hay citas registradas.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </main>

      {/* Modal de confirmación para CONFIRMAR */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Cita</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que deseas confirmar esta cita?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancelar
          </Button>
          <Button variant="success" onClick={handleUpdateStatus}>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmación para CANCELAR */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cancelar Cita</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que deseas cancelar esta cita?</p>
          <p className="text-muted small">Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Cerrar
          </Button>
          <Button variant="danger" onClick={handleUpdateStatus}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de detalles de la reserva */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Detalles de la Cita</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReserva && (
            <>
              <p>
                <strong>Paciente:</strong>{" "}
                {selectedReserva.paciente?.user?.first_name}{" "}
                {selectedReserva.paciente?.user?.last_name}
              </p>
              <p>
                <strong>Procedimiento:</strong>{" "}
                {selectedReserva.procedimiento?.nombre || "N/A"}
              </p>
              <p>
                <strong>Fecha y Hora:</strong>{" "}
                {format(
                  new Date(selectedReserva.fecha_hora),
                  "dd MMM yyyy HH:mm",
                  {
                    locale: es,
                  }
                )}
              </p>
              <p>
                <strong>Estado:</strong>{" "}
                {getStatusBadge(selectedReserva.estado)}
              </p>
              <hr />
              <p>
                <strong>Notas del Doctor:</strong>
                <br />
                {selectedReserva.notas_doctor || "No hay notas para esta cita."}
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowDetailsModal(false)}
          >
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de notas (el nuevo componente) */}
      {selectedReserva && (
        <AddNotesModal
          show={showNotesModal}
          onHide={() => setShowNotesModal(false)}
          reserva={selectedReserva}
          token={getAccessTokenSilently()}
          onNotesAdded={onNotesAdded}
        />
      )}
    </div>
  );
}
