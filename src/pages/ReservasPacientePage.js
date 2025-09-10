// src/pages/ReservasPacientePage.js

import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import DoctoresList from "../components/reservas/DoctoresList";
import ProcedimientosCarousel from "../components/reservas/ProcedimientosCarousel";
import { api } from "../services/api";

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
  const [horaInput, setHoraInput] = useState("");
  const [slotsGenerados, setSlotsGenerados] = useState([]);

  useEffect(() => {
    // 🔹 Cargar lista de procedimientos básicos
    const fetchProcedimientos = async () => {
      try {
        const res = await api.get("procedimientos/");
        setProcedimientos(res.data);
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

          const { bloques_disponibles, citas_reservadas } = res.data;

          setDisponibilidad({
            bloques: bloques_disponibles,
            citas: citas_reservadas,
          });
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
      setProcedimiento(null);
      setDoctorSeleccionado(null);
      setFechaHoraSeleccionada(null);
      setDisponibilidad({ bloques: [], citas: [] });
    } catch (error) {
      console.error("Error al reservar cita:", error.response?.data || error);
      setMensaje("❌ Ocurrió un error al reservar la cita.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSlots = () => {
    setMensaje("");
    setSlotsGenerados([]);

    const [hour, minute] = horaInput.split(":").map(Number);
    if (
      isNaN(hour) ||
      isNaN(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      setMensaje("❌ Por favor, ingrese un formato de hora válido (HH:MM).");
      return;
    }

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    const availableBlock = disponibilidad.bloques.find((bloque) => {
      const blockStart = new Date(bloque.start);
      const blockEnd = new Date(bloque.end);

      const inputDateTime = new Date(blockStart);
      inputDateTime.setHours(hour, minute, 0, 0);

      return inputDateTime >= blockStart && inputDateTime <= blockEnd;
    });

    if (!availableBlock) {
      setMensaje(
        "❌ La hora ingresada no está dentro de un bloque disponible."
      );
      return;
    }

    const { start, end } = availableBlock;
    const blockStart = new Date(start);
    const blockEnd = new Date(end);
    const generatedSlots = [];

    const now = new Date();

    // Create a date object for today with the input time
    const today = new Date();
    today.setHours(hour, minute, 0, 0);

    let currentTime = today;

    while (
      currentTime.getTime() + procedimiento.duracion_min * 60000 <=
      blockEnd.getTime()
    ) {
      const isBooked = disponibilidad.citas.some((cita) => {
        const citaStart = new Date(cita.start);
        const citaEnd = new Date(cita.end);
        return (
          currentTime < citaEnd &&
          new Date(currentTime.getTime() + procedimiento.duracion_min * 60000) >
            citaStart
        );
      });

      if (!isBooked && currentTime >= now) {
        generatedSlots.push(currentTime.toISOString());
      }
      currentTime = new Date(
        currentTime.getTime() + procedimiento.duracion_min * 60000
      );
    }

    if (generatedSlots.length > 0) {
      setSlotsGenerados(generatedSlots);
      setMensaje("✅ Horarios generados. Por favor, seleccione uno.");
    } else {
      setMensaje("❌ No hay slots disponibles en este bloque.");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "500px", margin: "0 auto" }}>
      <h2>Reservar nueva cita</h2>
      <p>Paciente: {user?.name || "Paciente"}</p>

      {/* 1. Selección de Procedimiento */}
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
              {disponibilidad.bloques.length > 0 ? (
                <>
                  <p>
                    **Ingresa una hora para ver los slots disponibles (ej.
                    09:30):**
                  </p>
                  <input
                    type="time"
                    value={horaInput}
                    onChange={(e) => setHoraInput(e.target.value)}
                  />
                  <button
                    onClick={handleGenerateSlots}
                    style={{ marginLeft: "10px" }}
                  >
                    Generar Slots
                  </button>

                  <div style={{ marginTop: "1rem" }}>
                    {slotsGenerados.length > 0 ? (
                      <>
                        <p>**Slots disponibles:**</p>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.5rem",
                          }}
                        >
                          {slotsGenerados.map((slot, index) => (
                            <button
                              key={index}
                              onClick={() => setFechaHoraSeleccionada(slot)}
                              style={{
                                padding: "0.5rem 1rem",
                                border: "1px solid #ddd",
                                backgroundColor:
                                  fechaHoraSeleccionada === slot
                                    ? "#27ae60"
                                    : "white",
                                color:
                                  fechaHoraSeleccionada === slot
                                    ? "white"
                                    : "black",
                                cursor: "pointer",
                              }}
                            >
                              {new Date(slot).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p>Ingresa una hora válida y genera slots.</p>
                    )}
                  </div>
                </>
              ) : (
                <p>No hay horarios disponibles para este día.</p>
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
