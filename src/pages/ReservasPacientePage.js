// src/pages/ReservasPacientePage.js

import { useAuth0 } from "@auth0/auth0-react";
import moment from "moment"; // <--- RE-ADD THIS IMPORT
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { api } from "../services/api";
import "./ReservasPacientePage.css"; // Keep this here for general page styles

// Import the new modular components
import DoctoresList from "../components/reservas/DoctoresList";
import BookingSuccessModal from "../components/reservas/paciente/BookingSuccessModal";
import CalendarioReservas from "../components/reservas/paciente/CalendarioReservas";
import ProcedimientosCarousel from "../components/reservas/ProcedimientosCarousel";

export default function ReservasPacientePage() {
  const { user, getAccessTokenSilently } = useAuth0();
  const [procedimientos, setProcedimientos] = useState([]);
  const [procedimiento, setProcedimiento] = useState(null);
  const [doctores, setDoctores] = useState([]);
  const [doctorSeleccionado, setDoctorSeleccionado] = useState(null);
  const [disponibilidad, setDisponibilidad] = useState({
    bloques: [],
    citas: [],
  });
  const [fechaHoraSeleccionada, setFechaHoraSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mensajeVisible, setMensajeVisible] = useState(false);
  const [mensajeTipo, setMensajeTipo] = useState(null);
  const [pendingEvent, setPendingEvent] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();

  // Unified fetch function for procedures and doctors
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [procedimientosRes, doctoresRes] = await Promise.all([
        api.get("procedimientos/"),
        api.get("doctores/"),
      ]);
      setProcedimientos(procedimientosRes.data);
      setDoctores(doctoresRes.data);
    } catch (err) {
      console.error("Error al obtener datos:", err);
      showMessage("❌ Error al cargar los datos.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchDisponibilidad = useCallback(async () => {
    if (doctorSeleccionado && procedimiento) {
      setLoading(true);
      try {
        const token = await getAccessTokenSilently();
        // These lines use moment
        const startDate = moment().format("YYYY-MM-DD");
        const endDate = moment()
          .add(3, "weeks")
          .endOf("week")
          .format("YYYY-MM-DD");

        const res = await api.get(`reservas/disponibilidad/`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            doctor_id: doctorSeleccionado.id,
            procedimiento_id: procedimiento.id,
            start_date: startDate,
            end_date: endDate,
          },
        });

        const { bloques_disponibles, citas_reservadas } = res.data;

        setDisponibilidad({
          bloques: bloques_disponibles,
          citas: citas_reservadas,
        });
      } catch (err) {
        console.error("Error al obtener disponibilidad:", err);
        showMessage(
          "❌ No hay horarios disponibles para este doctor.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    }
  }, [doctorSeleccionado, procedimiento, getAccessTokenSilently]);

  useEffect(() => {
    fetchDisponibilidad();
  }, [fetchDisponibilidad]);

  const handleReserva = async () => {
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      const pacienteResponse = await api.get(
        `pacientes/by_email/${user.email}/`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const pacienteId = pacienteResponse.data.id;

      const reservaParaEnviar = {
        paciente_id: pacienteId,
        doctor_id: doctorSeleccionado.id,
        procedimiento_id: procedimiento.id,
        fecha_hora: fechaHoraSeleccionada,
        duracion_min: procedimiento.duracion_min,
      };

      await api.post("reservas/", reservaParaEnviar, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setShowSuccessModal(true);

      setProcedimiento(null);
      setDoctorSeleccionado(null);
      setFechaHoraSeleccionada(null);
      setPendingEvent(null);
    } catch (error) {
      console.error("Error al reservar cita:", error.response?.data || error);
      showMessage("❌ Ocurrió un error al reservar la cita.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (text, type, temporary = false) => {
    setMensaje(text);
    setMensajeTipo(type);
    setMensajeVisible(true);
    if (temporary) {
      setTimeout(() => setMensajeVisible(false), 5000);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/", { state: { bookingSuccess: true } });
  };

  return (
    <div className="d-flex vh-100 bg-light font-sans">
      <Sidebar userRole="paciente" />
      <main className="flex-grow-1 p-3 overflow-auto">
        <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
          <h2>Reservar nueva cita</h2>
          <p>Paciente: {user?.name || "Paciente"}</p>

          <section>
            <h3>1. Elige un procedimiento</h3>
            <ProcedimientosCarousel
              procedimientos={procedimientos}
              onSelect={setProcedimiento}
            />
            {procedimiento && (
              <p>
                Seleccionaste: <strong>{procedimiento.nombre}</strong> (
                {procedimiento.duracion_min} min)
              </p>
            )}
          </section>

          {procedimiento && (
            <section>
              <h3>2. Elige un doctor</h3>
              <DoctoresList
                doctores={doctores}
                onSelect={setDoctorSeleccionado}
              />
            </section>
          )}

          {procedimiento && doctorSeleccionado && (
            <section>
              <h3>3. Elige fecha y hora</h3>
              <CalendarioReservas
                disponibilidad={disponibilidad}
                procedimiento={procedimiento}
                loading={loading}
                setFechaHoraSeleccionada={setFechaHoraSeleccionada}
                setPendingEvent={setPendingEvent}
                pendingEvent={pendingEvent}
                showMessage={showMessage}
              />
            </section>
          )}

          {procedimiento && doctorSeleccionado && fechaHoraSeleccionada && (
            <button
              onClick={handleReserva}
              disabled={loading}
              style={{
                marginTop: "1rem",
                backgroundColor: "#27ae60",
                color: "white",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              {loading ? "Reservando..." : "Confirmar Cita"}
            </button>
          )}

          {mensajeVisible && (
            <div className={`message-container bottom-right ${mensajeTipo}`}>
              {mensaje}
            </div>
          )}

          <BookingSuccessModal
            show={showSuccessModal}
            onHide={handleCloseSuccessModal}
          />
        </div>
      </main>
    </div>
  );
}
