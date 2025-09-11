// src/components/doctor/horarios/HorarioConfirmationModals.js

import { Button, Form, Modal } from "react-bootstrap";

const HorarioConfirmationModals = ({
  showSaveTemplateModal,
  setShowSaveTemplateModal,
  templateName,
  setTemplateName,
  handleSaveTemplate,
  showDeleteModal,
  setShowDeleteModal,
  handleConfirmDeleteHorario,
}) => {
  return (
    <>
      {/* Modal para guardar la plantilla */}
      <Modal
        show={showSaveTemplateModal}
        onHide={() => setShowSaveTemplateModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Guardar Horario como Plantilla</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de la plantilla</Form.Label>
              <Form.Control
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Ej. Horario de Verano"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowSaveTemplateModal(false)}
          >
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveTemplate}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmación para eliminar */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>¿Estás seguro de que deseas eliminar este bloque de horario?</p>
          <p>
            Este horario ya no será visible en el calendario ni en la tabla,
            pero sus datos se conservarán en la base de datos.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handleConfirmDeleteHorario}>
            Sí, eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default HorarioConfirmationModals;
