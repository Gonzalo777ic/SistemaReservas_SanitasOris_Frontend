// src/components/doctor/horarios/HorarioTemplates.js

import { Button, Form } from "react-bootstrap";
import { MdCheckCircle, MdRefresh, MdSave } from "react-icons/md";

const HorarioTemplates = ({
  savedSchedules,
  selectedTemplate,
  setSelectedTemplate,
  onSaveTemplateClick,
  onApplyTemplate,
  onActivateTemplate,
}) => {
  return (
    <div className="d-flex justify-content-center gap-3 mb-4">
      <Button variant="success" onClick={onSaveTemplateClick}>
        <MdSave className="me-2" />
        Guardar como Plantilla
      </Button>
      <Form.Select
        style={{ width: "250px" }}
        value={selectedTemplate}
        onChange={(e) => setSelectedTemplate(e.target.value)}
      >
        <option value="">Selecciona una plantilla...</option>
        {savedSchedules.map((t) => (
          <option key={t.id} value={t.id}>
            {t.nombre} {t.es_activo ? "(Activo)" : ""}
          </option>
        ))}
      </Form.Select>

      <Button
        variant="info"
        onClick={onApplyTemplate}
        disabled={!selectedTemplate}
      >
        <MdRefresh className="me-2" />
        Ver Horario
      </Button>

      <Button
        variant="secondary"
        onClick={onActivateTemplate}
        disabled={!selectedTemplate}
      >
        <MdCheckCircle className="me-2" />
        Activar
      </Button>
    </div>
  );
};

export default HorarioTemplates;
