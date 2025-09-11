// src/components/admin/procedimientos/ProcedimientosTable.js

import { Button, Card, Table } from "react-bootstrap";
import { MdDelete, MdEdit } from "react-icons/md";

const ProcedimientosTable = ({ procedimientos, onEdit, onDelete }) => {
  return (
    <Card className="shadow-sm">
      <Card.Body>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Duración (min)</th>
              <th>Doctores</th>
              <th>Activo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {procedimientos.length > 0 ? (
              procedimientos.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>
                    {p.imagen && (
                      <img
                        src={p.imagen}
                        alt={p.nombre}
                        className="image-preview"
                      />
                    )}
                  </td>
                  <td>{p.nombre}</td>
                  <td>{p.descripcion}</td>
                  <td>{p.duracion_min}</td>
                  <td>
                    {p.doctores_nombres?.length > 0
                      ? p.doctores_nombres.join(", ")
                      : "Ninguno"}
                  </td>
                  <td>{p.activo ? "Sí" : "No"}</td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      className="me-2"
                      onClick={() => onEdit(p)}
                    >
                      <MdEdit />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onDelete(p.id)}
                    >
                      <MdDelete />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center text-muted">
                  No hay procedimientos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default ProcedimientosTable;
