// src/components/doctor/horarios/HorarioTable.js

import { Button, Table } from "react-bootstrap";
import { MdDelete, MdEdit } from "react-icons/md";
import { DIAS_SEMANA_MAP } from "../.././../pages/HorarioDoctorPage"; // Import from the parent or define locally if it's only for this table

const HorarioTable = ({ horarios, onEdit, onDelete, onToggleActive }) => {
  return (
    <>
      <h5 className="card-title fw-semibold text-primary mb-3">Mis Horarios</h5>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Día</th>
            <th>Hora Inicio</th>
            <th>Hora Fin</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {horarios.length > 0 ? (
            horarios.map((horario) => (
              <tr key={horario.id}>
                <td>
                  {
                    DIAS_SEMANA_MAP.find((d) => d.value === horario.dia_semana)
                      ?.label
                  }
                </td>
                <td>{horario.hora_inicio}</td>
                <td>{horario.hora_fin}</td>
                <td>
                  <Button
                    variant={
                      horario.activo ? "outline-secondary" : "outline-success"
                    }
                    size="sm"
                    onClick={() => onToggleActive(horario)}
                  >
                    {horario.activo ? "Ocultar" : "Mostrar"}
                  </Button>
                </td>
                <td>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="me-2"
                    onClick={() => onEdit(horario)}
                  >
                    <MdEdit />
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => onDelete(horario)}
                  >
                    <MdDelete />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center text-muted">
                No hay horarios registrados.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </>
  );
};

export default HorarioTable;
