// src/components/paciente/CancelAppointmentModal.js

import format from "date-fns/format";
import { es } from "date-fns/locale";
import { Button, Modal } from "react-bootstrap";

const CancelAppointmentModal = ({
  show,
  onHide,
  appointmentToCancel,
  handleCancelAppointment,
}) => {
  return (
    <Modal show={show} onHide={onHide}>
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
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
        <Button variant="danger" onClick={handleCancelAppointment}>
          Cancelar Cita
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CancelAppointmentModal;
