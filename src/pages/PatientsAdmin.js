// src/pages/PatientsAdmin.js

import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import PatientSearchBar from "../components/admin/patients/PatientSearchBar"; // Nuevo
import PatientsTable from "../components/admin/patients/PatientsTable"; // Nuevo

// Importa los estilos de Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";

export default function PatientsAdmin() {
  const { getAccessTokenSilently } = useAuth0();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchPatients = useCallback(
    async (query = "") => {
      try {
        setLoading(true);
        setError(null);
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: process.env.REACT_APP_AUTH0_AUDIENCE,
          },
        });

        const url = `http://localhost:8000/api/pacientes/?search=${encodeURIComponent(
          query
        )}`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setPatients(data);
      } catch (err) {
        console.error("❌ Error fetching patients:", err);
        setError("No se pudo cargar la lista de pacientes.");
      } finally {
        setLoading(false);
      }
    },
    [getAccessTokenSilently]
  );

  useEffect(() => {
    fetchPatients(searchTerm);
  }, [fetchPatients, searchTerm]);

  return (
    <div className="d-flex vh-100 bg-light font-sans">
      <Sidebar userRole="admin" />

      <main className="flex-grow-1 p-3 overflow-auto">
        <Container fluid>
          <div className="mb-4">
            <h1 className="h4 fw-bold text-dark">Gestión de Pacientes</h1>
            <p className="text-secondary">
              Lista completa y detalles de los pacientes registrados.
            </p>
          </div>

          <div className="card shadow-sm p-4">
            <PatientSearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />

            {loading ? (
              <div className="d-flex justify-content-center my-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </Spinner>
              </div>
            ) : error ? (
              <div className="alert alert-danger text-center">{error}</div>
            ) : (
              <PatientsTable patients={patients} />
            )}
          </div>
        </Container>
      </main>
    </div>
  );
}
