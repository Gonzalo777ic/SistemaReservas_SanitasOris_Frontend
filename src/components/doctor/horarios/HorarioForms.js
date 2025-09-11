// src/components/doctor/horarios/HorarioForms.js

import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { DIAS_SEMANA_MAP } from "../.././../pages/HorarioDoctorPage"; // Import from the parent or define locally if only for this form

const HorarioForms = ({
  show,
  onHide,
  form,
  handleInputChange,
  handleSubmit,
  currentEdit,
}) => {
  return (
    <Modal show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          {currentEdit ? "Editar Horario" : "Añadir Nuevo Horario"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Día de la semana</Form.Label>
            <Form.Control
              as="select"
              name="dia_semana"
              value={form.dia_semana}
              onChange={handleInputChange}
            >
              {DIAS_SEMANA_MAP.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
          <Row className="mb-3">
            <Col>
              <Form.Group>
                <Form.Label>Hora de inicio</Form.Label>
                <Form.Control
                  type="time"
                  name="hora_inicio"
                  value={form.hora_inicio}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group>
                <Form.Label>Hora de fin</Form.Label>
                <Form.Control
                  type="time"
                  name="hora_fin"
                  value={form.hora_fin}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <div className="d-flex justify-content-end">
            <Button variant="primary" type="submit">
              {currentEdit ? "Guardar Cambios" : "Guardar Horario"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default HorarioForms;
