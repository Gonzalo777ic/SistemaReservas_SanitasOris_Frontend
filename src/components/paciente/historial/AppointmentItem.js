// src/components/paciente/historial/AppointmentItem.js

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge, Card, ListGroup } from "react-bootstrap";

const getStatusBadge = (estado) => {
  switch (estado) {
    case "confirmada":
      return <Badge bg="success">Confirmada</Badge>;
    case "pendiente":
      return (
        <Badge bg="warning" className="text-dark">
          Pendiente
        </Badge>
      );
    case "cancelada":
      return <Badge bg="danger">Cancelada</Badge>;
    case "completada":
      return <Badge bg="primary">Completada</Badge>;
    default:
      return <Badge bg="secondary">{estado}</Badge>;
  }
};

const AppointmentItem = ({ cita }) => {
  return (
    <ListGroup.Item key={cita.id} className="shadow-sm rounded-3 mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h5 className="mb-0 fw-bold text-dark">
          Cita con Dr(a).{" "}
          {cita.doctor?.user?.first_name || cita.doctor?.nombre || "N/A"}
        </h5>
        {getStatusBadge(cita.estado)}
      </div>
      <p className="mb-1 text-secondary">
        <small>
          <strong>Fecha y Hora:</strong>{" "}
          {format(new Date(cita.fecha_hora), "dd MMMM yyyy HH:mm", {
            locale: es,
          })}
        </small>
      </p>
      <p className="mb-1 text-secondary">
        <small>
          <strong>Procedimiento:</strong> {cita.procedimiento?.nombre || "N/A"}
        </small>
      </p>
      <Card className="mt-3 bg-light border-0">
        <Card.Body className="p-3">
          <h6 className="fw-semibold text-primary mb-2">Notas del Doctor:</h6>
          <p className="mb-0 text-muted small">
            {cita.notas_doctor || "No hay notas para esta cita."}
          </p>
        </Card.Body>
      </Card>
    </ListGroup.Item>
  );
};

export default AppointmentItem;
