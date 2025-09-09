// src/components/AddNotesModal.js

import { useEffect, useState } from "react";
import { Alert, Button, Form, Modal } from "react-bootstrap";
import { api } from "../services/api";

export default function AddNotesModal({
  show,
  onHide,
  reserva,
  token,
  onNotesAdded,
}) {
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (reserva) {
      setNotes(reserva.notas_doctor || "");
      setError(null);
      setSuccess(false);
    }
  }, [reserva]);

  const handleSaveNotes = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await api.patch(
        `reservas/${reserva.id}/`,
        { notas_doctor: notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      if (onNotesAdded) {
        onNotesAdded({ ...reserva, notas_doctor: notes });
      }
      setTimeout(() => {
        onHide();
      }, 1500); // Cierra el modal después de 1.5 segundos
    } catch (err) {
      console.error("Error saving notes:", err);
      setError("Error al guardar las notas. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  if (!reserva) return null;

  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          Notas sobre la Cita de {reserva.paciente?.user?.first_name}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {success && (
          <Alert variant="success">Notas guardadas exitosamente!</Alert>
        )}
        {error && <Alert variant="danger">{error}</Alert>}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Notas del Doctor</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Escribe tus notas aquí..."
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={handleSaveNotes} disabled={loading}>
          {loading ? "Guardando..." : "Guardar Notas"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
