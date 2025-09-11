// src/components/citas/CitasTable.js

import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge, Button, Table } from "react-bootstrap";
import { MdCancel, MdCheckCircle, MdEditNote, MdInfo } from "react-icons/md";

const getStatusBadge = (estado) => {
  switch (estado) {
    case "pendiente":
      return <Badge bg="warning">Pendiente</Badge>;
    case "confirmada":
      return <Badge bg="success">Confirmada</Badge>;
    case "cancelada":
      return <Badge bg="danger">Cancelada</Badge>;
    case "completada":
      return <Badge bg="primary">Completada</Badge>;
    default:
      return <Badge bg="secondary">{estado}</Badge>;
  }
};

const CitasTable = ({
  reservas,
  loading,
  error,
  setShowDetailsModal,
  setSelectedReserva,
  setShowNotesModal,
  setReservaToUpdate,
  setNewStatusToApply,
  setShowConfirmModal,
  setShowCancelModal,
}) => {
  if (loading) {
    return <div className="text-center">Cargando citas...</div>;
  }

  if (error) {
    return <div className="text-center text-danger">{error}</div>;
  }

  const handleShowDetails = (reserva) => {
    setSelectedReserva(reserva);
    setShowDetailsModal(true);
  };

  const handleShowNotesModal = (reserva) => {
    setSelectedReserva(reserva);
    setShowNotesModal(true);
  };

  const handleShowConfirmModal = (reserva) => {
    setReservaToUpdate(reserva);
    setNewStatusToApply("confirmada");
    setShowConfirmModal(true);
  };

  const handleShowCancelModal = (reserva) => {
    setReservaToUpdate(reserva);
    setNewStatusToApply("cancelada");
    setShowCancelModal(true);
  };

  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Fecha y Hora</th>
          <th>Paciente</th>
          <th>Procedimiento</th>
          <th>Estado</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {reservas.length > 0 ? (
          reservas.map((reserva) => (
            <tr key={reserva.id}>
              <td>
                {format(new Date(reserva.fecha_hora), "dd MMM yyyy HH:mm", {
                  locale: es,
                })}
              </td>
              <td>
                {reserva.paciente?.user?.first_name}{" "}
                {reserva.paciente?.user?.last_name}
              </td>
              <td>{reserva.procedimiento?.nombre || "N/A"}</td>
              <td>{getStatusBadge(reserva.estado)}</td>
              <td>
                <div className="d-flex gap-2">
                  {reserva.estado === "pendiente" && (
                    <>
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => handleShowConfirmModal(reserva)}
                      >
                        <MdCheckCircle />
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleShowCancelModal(reserva)}
                      >
                        <MdCancel />
                      </Button>
                    </>
                  )}
                  <Button
                    variant="info"
                    size="sm"
                    onClick={() => handleShowDetails(reserva)}
                  >
                    <MdInfo />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleShowNotesModal(reserva)}
                  >
                    <MdEditNote />
                  </Button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="5" className="text-center text-muted">
              No hay citas registradas.
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default CitasTable;
