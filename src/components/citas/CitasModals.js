// src/components/citas/CitasModals.js

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button, Modal } from "react-bootstrap";
import AddNotesModal from "../AddNotesModal";

const CitasModals = ({
  showDetailsModal,
  setShowDetailsModal,
  showNotesModal,
  setShowNotesModal,
  showConfirmModal,
  setShowConfirmModal,
  showCancelModal,
  setShowCancelModal,
  selectedReserva,
  handleUpdateStatus,
  onNotesAdded,
  getAccessTokenSilently,
}) => {
  const getStatusBadge = (estado) => {
    switch (estado) {
      case "pendiente":
        return <span className="badge bg-warning">Pendiente</span>;
      case "confirmada":
        return <span className="badge bg-success">Confirmada</span>;
      case "cancelada":
        return <span className="badge bg-danger">Cancelada</span>;
      case "completada":
        return <span className="badge bg-primary">Completada</span>;
      default:
        return <span className="badge bg-secondary">{estado}</span>;
    }
  };

  return (
    <>
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
                  { locale: es }
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

      {/* Modal de notas (reutilizamos el componente AddNotesModal) */}
      {showNotesModal && selectedReserva && (
        <AddNotesModal
          show={true}
          onHide={() => setShowNotesModal(false)}
          reserva={selectedReserva}
          token={
            typeof getAccessTokenSilently === "function"
              ? getAccessTokenSilently()
              : getAccessTokenSilently
          }
          onNotesAdded={onNotesAdded}
        />
      )}
    </>
  );
};

export default CitasModals;
