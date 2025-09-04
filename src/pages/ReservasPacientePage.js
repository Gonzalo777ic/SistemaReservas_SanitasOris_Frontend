// src/pages/ReservasPacientePage.js

import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import DoctoresList from "../components/reservas/DoctoresList";
import ProcedimientosCarousel from "../components/reservas/ProcedimientosCarousel";
import { api } from "../services/api";

export default function ReservasPacientePage() {
  const { user, getAccessTokenSilently } = useAuth0();
  const [procedimiento, setProcedimiento] = useState(null);
  const [doctores, setDoctores] = useState([]);
  const [doctorSeleccionado, setDoctorSeleccionado] = useState(null);
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [fechaHoraSeleccionada, setFechaHoraSeleccionada] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    // 🔹 Cargar lista de procedimientos básicos
    const fetchProcedimientos = async () => {
      try {
        const res = await api.get("procedimientos/");
        // Asume que el carrusel se encarga de mostrar estos datos
        console.log(res.data);
      } catch (err) {
        console.error("Error al obtener procedimientos:", err);
      }
    };
    fetchProcedimientos();

    // 🔹 Cargar lista de doctores
    const fetchDoctores = async () => {
      try {
        const res = await api.get("doctores/");
        setDoctores(res.data);
      } catch (err) {
        console.error("Error al obtener doctores:", err);
      }
    };
    fetchDoctores();
  }, []);

  useEffect(() => {
    // 🔹 Cargar disponibilidad al seleccionar doctor y procedimiento
    const fetchDisponibilidad = async () => {
      if (doctorSeleccionado && procedimiento) {
        setLoading(true);
        try {
          const token = await getAccessTokenSilently();
          const res = await api.get(`reservas/disponibilidad/`, {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              doctor_id: doctorSeleccionado.id,
              procedimiento_id: procedimiento.id,
            },
          });
          setDisponibilidad(res.data.slots_disponibles);
        } catch (err) {
          console.error("Error al obtener disponibilidad:", err);
          setMensaje("❌ No hay horarios disponibles para este doctor.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchDisponibilidad();
  }, [doctorSeleccionado, procedimiento, getAccessTokenSilently]);

  const handleReserva = async () => {
    // 🔹 Lógica para crear la reserva
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

      setMensaje("✅ Cita reservada con éxito");
      // Reiniciar estado para una nueva reserva
      setProcedimiento(null);
      setDoctorSeleccionado(null);
      setFechaHoraSeleccionada(null);
      setDisponibilidad([]);
    } catch (error) {
      console.error("Error al reservar cita:", error.response?.data || error);
      setMensaje("❌ Ocurrió un error al reservar la cita.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "500px", margin: "0 auto" }}>
      <h2>Reservar nueva cita</h2>
      <p>Paciente: {user?.name || "Paciente"}</p>

      {/* 1. Selección de Procedimiento */}
      <h3>1. Elige un procedimiento</h3>
      <ProcedimientosCarousel onSelect={setProcedimiento} />
      {procedimiento && (
        <p>
          Seleccionaste: <strong>{procedimiento.nombre}</strong> (
          {procedimiento.duracion_min} min)
        </p>
      )}

      {/* 2. Selección de Doctor */}
      {procedimiento && (
        <div>
          <h3>2. Elige un doctor</h3>
          <DoctoresList doctores={doctores} onSelect={setDoctorSeleccionado} />
        </div>
      )}

      {/* 3. Selección de Fecha y Hora */}
      {procedimiento && doctorSeleccionado && (
        <div>
          <h3>3. Elige fecha y hora</h3>
          {loading ? (
            <p>Cargando horarios disponibles...</p>
          ) : (
            <div>
              {disponibilidad.length > 0 ? (
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                >
                  {disponibilidad.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setFechaHoraSeleccionada(slot)}
                      style={{
                        padding: "0.5rem 1rem",
                        border: "1px solid #ddd",
                        backgroundColor:
                          fechaHoraSeleccionada === slot ? "#27ae60" : "white",
                        color:
                          fechaHoraSeleccionada === slot ? "white" : "black",
                        cursor: "pointer",
                      }}
                    >
                      {new Date(slot).toLocaleString()}
                    </button>
                  ))}
                </div>
              ) : (
                <p>No hay horarios disponibles.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Confirmación de la cita */}
      {fechaHoraSeleccionada && (
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

      {mensaje && <p style={{ marginTop: "1rem" }}>{mensaje}</p>}
    </div>
  );
}
