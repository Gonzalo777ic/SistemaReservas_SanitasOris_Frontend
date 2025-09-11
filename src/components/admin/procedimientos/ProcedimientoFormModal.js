// src/components/admin/procedimientos/ProcedimientoFormModal.js

import { Button, Form, Modal } from "react-bootstrap";
import Select from "react-select";

const ProcedimientoFormModal = ({
  show,
  onHide,
  isEditing,
  currentProcedimiento,
  formData,
  handleChange,
  handleSelectChange,
  handleSubmit,
  doctorOptions,
}) => {
  return (
    <Modal size="xl" show={show} onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEditing ? "Editar Procedimiento" : "Nuevo Procedimiento"}
        </Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Nombre</Form.Label>
            <Form.Control
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Descripción</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Duración (minutos)</Form.Label>
            <Form.Control
              type="number"
              name="duracion_min"
              value={formData.duracion_min}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              label="Activo"
              name="activo"
              checked={formData.activo}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Doctores que realizan este procedimiento</Form.Label>
            <Select
              isMulti
              name="doctores"
              options={doctorOptions}
              className="basic-multi-select"
              classNamePrefix="select"
              onChange={handleSelectChange}
              value={doctorOptions.filter((option) =>
                formData.doctores.includes(option.value)
              )}
            />
            <Form.Text className="text-muted">
              Selecciona o elimina doctores de la lista.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Imagen</Form.Label>
            <Form.Control type="file" name="imagen" onChange={handleChange} />
          </Form.Group>

          {isEditing && currentProcedimiento?.imagen && !formData.imagen && (
            <div className="mb-3 text-center">
              <p className="mb-1">Imagen actual:</p>
              <img
                src={currentProcedimiento.imagen}
                alt="Actual"
                className="image-preview-modal border rounded"
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>
            Cancelar
          </Button>
          <Button variant="primary" type="submit">
            Guardar
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ProcedimientoFormModal;
