// src/pages/PacientesDoctorPage.js

import { useAuth0 } from "@auth0/auth0-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useCallback, useEffect, useState } from "react";
import { Card, Table } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import { api } from "../services/api";

export default function PacientesDoctorPage() {
  const { getAccessTokenSilently } = useAuth0();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPatients = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        },
      });

      // Fetch all reservations for the current doctor
      const reservationsRes = await api.get("reservas/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Get the reservations data
      const reservations = reservationsRes.data;

      // Extract unique patients from the reservations
      const uniquePatients = {};
      reservations.forEach((reservation) => {
        if (!uniquePatients[reservation.paciente.id]) {
          uniquePatients[reservation.paciente.id] = reservation.paciente;
        }
      });

      // Convert the uniquePatients object into an array
      const patientsArray = Object.values(uniquePatients);

      setPatients(patientsArray);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching patients:", err.response?.data || err);
      setError("Error al cargar la lista de pacientes.");
      setLoading(false);
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  return (
    <div className="d-flex vh-100 bg-light font-sans">
      <Sidebar userRole="doctor" />
      <main className="flex-grow-1 p-3 overflow-auto">
        <h2 className="text-secondary fw-bold mb-4">Mis Pacientes</h2>

        <Card className="shadow-sm">
          <Card.Body>
            <h5 className="card-title fw-semibold text-primary mb-3">
              Lista de Pacientes
            </h5>
            {loading ? (
              <div className="text-center">Cargando pacientes...</div>
            ) : error ? (
              <div className="text-center text-danger">{error}</div>
            ) : (
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
                          {patient.user.first_name} {patient.user.last_name}
                        </td>
                        <td>{patient.user.email}</td>
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
            )}
          </Card.Body>
        </Card>
      </main>
    </div>
  );
}
