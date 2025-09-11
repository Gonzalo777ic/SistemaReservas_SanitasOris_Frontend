// src/components/admin/reservas/ReservasTable.js

import { Badge, Button, Table } from "react-bootstrap";
import { MdCancel, MdCheckCircle } from "react-icons/md";

const getStatusBadge = (status) => {
  let variant;
  switch (status) {
    case "pendiente":
      variant = "warning";
      break;
    case "confirmada":
      variant = "success";
      break;
    case "cancelada":
      variant = "danger";
      break;
    default:
      variant = "secondary";
  }
  return (
    <Badge bg={variant}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const getPatientName = (reserva) => {
  if (reserva.paciente && reserva.paciente.user) {
    return (
      `${reserva.paciente.user.first_name || ""} ${
        reserva.paciente.user.last_name || ""
      }`.trim() || reserva.paciente.user.email
    );
  }
  return "Paciente desconocido";
};

const getDoctorName = (reserva) => {
  if (reserva.doctor && reserva.doctor.user) {
    return (
      `${reserva.doctor.user.first_name || ""} ${
        reserva.doctor.user.last_name || ""
      }`.trim() || reserva.doctor.user.email
    );
  }
  return "Doctor desconocido";
};

const ReservasTable = ({ reservas, onUpdateStatus }) => {
  return (
    <Table striped bordered hover responsive className="mb-0">
      <thead>
        <tr>
          <th>ID</th>
          <th>Paciente</th>
          <th>Doctor</th>
          <th>Procedimiento</th>
          <th>Fecha y Hora</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {reservas.length > 0 ? (
          reservas.map((reserva) => (
            <tr key={reserva.id}>
              <td>{reserva.id}</td>
              <td>{getPatientName(reserva)}</td>
              <td>{getDoctorName(reserva)}</td>
              <td>{reserva.procedimiento_nombre || "N/A"}</td>
              <td>{new Date(reserva.fecha_hora).toLocaleString()}</td>
              <td>{getStatusBadge(reserva.estado)}</td>
              <td>
                {reserva.estado === "pendiente" && (
                  <div className="d-flex gap-2">
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => onUpdateStatus(reserva.id, "confirmada")}
                      title="Aprobar"
                    >
                      <MdCheckCircle />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => onUpdateStatus(reserva.id, "cancelada")}
                      title="Cancelar"
                    >
                      <MdCancel />
                    </Button>
                  </div>
                )}
                {reserva.estado === "confirmada" && (
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onUpdateStatus(reserva.id, "cancelada")}
                    title="Cancelar"
                  >
                    <MdCancel />
                  </Button>
                )}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="7" className="text-center text-secondary">
              No se encontraron reservas con el filtro actual.
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default ReservasTable;
