// src/components/reservas/paciente/BookingSuccessModal.js

import { Button, Modal } from "react-bootstrap";

const BookingSuccessModal = ({ show, onHide }) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Cita Solicitada</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center">
        <h5>¡Tu cita se ha solicitado con éxito!</h5>
        <p>Te redirigiremos a tu dashboard.</p>
      </Modal.Body>
      <Modal.Footer className="justify-content-center">
        <Button variant="primary" onClick={onHide}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default BookingSuccessModal;
