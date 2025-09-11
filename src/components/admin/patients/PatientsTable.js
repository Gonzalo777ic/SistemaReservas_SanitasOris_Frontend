// src/components/admin/patients/PatientsTable.js

import { Table } from "react-bootstrap";

const PatientsTable = ({ patients }) => {
  return (
    <Table striped bordered hover responsive className="mb-0">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Apellido</th>
          <th>Email</th>
          <th>Teléfono</th>
          <th>Fecha de Registro</th>
        </tr>
      </thead>
      <tbody>
        {patients.length > 0 ? (
          patients.map((patient) => (
            <tr key={patient.id}>
              <td>{patient.id}</td>
              <td>{patient.user?.first_name || patient.first_name || "N/A"}</td>
              <td>{patient.user?.last_name || patient.last_name || "N/A"}</td>
              <td>{patient.user?.email || patient.email || "N/A"}</td>
              <td>{patient.telefono || "-"}</td>
              <td>
                {patient.fecha_registro
                  ? new Date(patient.fecha_registro).toLocaleDateString()
                  : "N/A"}
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6" className="text-center text-secondary">
              No se encontraron pacientes.
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default PatientsTable;
