// src/pages/ReservasAdmin.js

import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useEffect, useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import ReservasFilters from "../components/admin/reservas/ReservasFilters"; // New
import ReservasTable from "../components/admin/reservas/ReservasTable"; // New

// Importa los estilos de Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";

export default function ReservasAdmin() {
  const { getAccessTokenSilently } = useAuth0();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("pendiente");

  const fetchReservas = useCallback(
    async (currentFilter) => {
      try {
        setLoading(true);
        setError(null);
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: process.env.REACT_APP_AUTH0_AUDIENCE,
          },
        });

        const url = `/api/reservas/?estado=${currentFilter}`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setReservas(data);
      } catch (err) {
        console.error("❌ Error fetching reservas:", err);
        setError("No se pudo cargar la lista de reservas.");
      } finally {
        setLoading(false);
      }
    },
    [getAccessTokenSilently]
  );

  useEffect(() => {
    fetchReservas(filter);
  }, [fetchReservas, filter]);

  const handleUpdateStatus = async (reservaId, newStatus) => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        },
      });

      const url = `/api/reservas/${reservaId}/`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      fetchReservas(filter);
    } catch (err) {
      console.error(`❌ Error al actualizar el estado de la reserva:`, err);
      setError("No se pudo actualizar el estado de la reserva.");
    }
  };

  return (
    <div className="d-flex vh-100 bg-light">
      <Sidebar userRole="admin" />

      <main className="flex-grow-1 p-3 overflow-auto">
        <Container fluid>
          <div className="mb-4">
            <h1 className="h4 fw-bold text-dark">Gestión de Reservas</h1>
            <p className="text-secondary">
              Lista y control de todas las reservas de citas.
            </p>
          </div>

          <div className="card shadow-sm p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="h6 fw-bold m-0">Lista de Reservas</h2>
              <ReservasFilters filter={filter} setFilter={setFilter} />
            </div>

            {loading ? (
              <div className="d-flex justify-content-center my-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </Spinner>
              </div>
            ) : error ? (
              <div className="alert alert-danger text-center">{error}</div>
            ) : (
              <ReservasTable
                reservas={reservas}
                onUpdateStatus={handleUpdateStatus}
              />
            )}
          </div>
        </Container>
      </main>
    </div>
  );
}
