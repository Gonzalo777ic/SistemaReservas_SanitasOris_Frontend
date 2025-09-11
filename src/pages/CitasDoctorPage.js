// src/pages/CitasDoctorPage.js

import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import CitasModals from "../components/citas/CitasModals"; // New component
import CitasTable from "../components/citas/CitasTable"; // New component
import { api } from "../services/api";
import "./styles.css";

export default function CitasDoctorPage() {
  const { getAccessTokenSilently } = useAuth0();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReserva, setSelectedReserva] = useState(null);

  // States for modals
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [reservaToUpdate, setReservaToUpdate] = useState(null);
  const [newStatusToApply, setNewStatusToApply] = useState(null);

  const fetchReservas = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });
      const reservasRes = await api.get("reservas/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReservas(reservasRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar reservas:", err);
      setError("Error al cargar la lista de citas.");
      setLoading(false);
    }
  }, [getAccessTokenSilently]);

  const handleUpdateStatus = async () => {
    if (!reservaToUpdate || !newStatusToApply) return;
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });
      const updatedReserva = await api.patch(
        `reservas/${reservaToUpdate.id}/`,
        { estado: newStatusToApply },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReservas(
        reservas.map((reserva) =>
          reserva.id === reservaToUpdate.id ? updatedReserva.data : reserva
        )
      );
      setShowConfirmModal(false);
      setShowCancelModal(false);
    } catch (err) {
      console.error(
        "Error al actualizar el estado:",
        err.response?.data || err
      );
    }
  };

  const onNotesAdded = (updatedReserva) => {
    setReservas(
      reservas.map((r) => (r.id === updatedReserva.id ? updatedReserva : r))
    );
  };

  useEffect(() => {
    fetchReservas();
  }, [fetchReservas]);

  return (
    <div className="d-flex vh-100 bg-light font-sans">
      <Sidebar userRole="doctor" />
      <main className="flex-grow-1 p-3 overflow-auto">
        <h2 className="text-secondary fw-bold mb-4">Gestión de Citas</h2>
        <Card className="shadow-sm">
          <Card.Body>
            <h5 className="card-title fw-semibold text-primary mb-3">
              Próximas y Pasadas Citas
            </h5>
            <CitasTable
              reservas={reservas}
              loading={loading}
              error={error}
              setShowDetailsModal={setShowDetailsModal}
              setSelectedReserva={setSelectedReserva}
              setShowNotesModal={setShowNotesModal}
              setReservaToUpdate={setReservaToUpdate}
              setNewStatusToApply={setNewStatusToApply}
              setShowConfirmModal={setShowConfirmModal}
              setShowCancelModal={setShowCancelModal}
            />
          </Card.Body>
        </Card>
      </main>

      <CitasModals
        showDetailsModal={showDetailsModal}
        setShowDetailsModal={setShowDetailsModal}
        showNotesModal={showNotesModal}
        setShowNotesModal={setShowNotesModal}
        showConfirmModal={showConfirmModal}
        setShowConfirmModal={setShowConfirmModal}
        showCancelModal={showCancelModal}
        setShowCancelModal={setShowCancelModal}
        selectedReserva={selectedReserva}
        handleUpdateStatus={handleUpdateStatus}
        onNotesAdded={onNotesAdded}
        getAccessTokenSilently={getAccessTokenSilently}
      />
    </div>
  );
}
