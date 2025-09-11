// src/components/doctor/patients/DoctorPatientsTable.js

import { Table } from "react-bootstrap";

const DoctorPatientsTable = ({ patients }) => {
  return (
    <Table striped bordered hover responsive>
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Teléfono</th>
        </tr>
      </thead>
      <tbody>
        {patients.length > 0 ? (
          patients.map((patient) => (
            <tr key={patient.id}>
              <td>
                {patient.user?.first_name || patient.first_name || "N/A"}{" "}
                {patient.user?.last_name || patient.last_name || "N/A"}
              </td>
              <td>{patient.user?.email || patient.email || "N/A"}</td>
              <td>{patient.telefono || "N/A"}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="3" className="text-center text-muted">
              No hay pacientes registrados.
            </td>
          </tr>
        )}
      </tbody>
    </Table>
  );
};

export default DoctorPatientsTable;
