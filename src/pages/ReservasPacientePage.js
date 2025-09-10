import { useAuth0 } from "@auth0/auth0-react";
import moment from "moment";
import { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import { useNavigate } from "react-router-dom";
import DoctoresList from "../components/reservas/DoctoresList";
import ProcedimientosCarousel from "../components/reservas/ProcedimientosCarousel";
import Sidebar from "../components/Sidebar";
import { api } from "../services/api";
import "./ReservasPacientePage.css";

// Configuración del localizador para el calendario
const localizer = momentLocalizer(moment);

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
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState("");
  const [modalTime, setModalTime] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Nuevo estado para el modal de éxito
  const navigate = useNavigate();

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setModalDate("");
    setModalTime("");
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/", { state: { bookingSuccess: true } });
  };

  useEffect(() => {
    const fetchProcedimientos = async () => {
      try {
        const res = await api.get("procedimientos/");
        setProcedimientos(res.data);
      } catch (err) {
        console.error("Error al obtener procedimientos:", err);
      }
    };
    fetchProcedimientos();

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
    const fetchDisponibilidad = async () => {
      if (doctorSeleccionado && procedimiento) {
        setLoading(true);
        try {
          const token = await getAccessTokenSilently();
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
          setMensaje("❌ No hay horarios disponibles para este doctor.");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchDisponibilidad();
  }, [doctorSeleccionado, procedimiento, getAccessTokenSilently]);

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

      // Muestra el modal de éxito en lugar de un mensaje
      setShowSuccessModal(true);

      // Limpia los estados de selección, pero no los de la UI
      setProcedimiento(null);
      setDoctorSeleccionado(null);
      setFechaHoraSeleccionada(null);
      setPendingEvent(null);
    } catch (error) {
      console.error("Error al reservar cita:", error.response?.data || error);
      setMensaje("❌ Ocurrió un error al reservar la cita.");
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

  const handleSelectSlot = ({ start }) => {
    const isSlotAvailable = disponibilidad.bloques.some((bloque) => {
      const blockStart = new Date(bloque.start);
      const blockEnd = new Date(bloque.end);
      return start >= blockStart && start < blockEnd;
    });

    const isSlotBooked = disponibilidad.citas.some((cita) => {
      const citaStart = new Date(cita.start);
      const citaEnd = new Date(cita.end);
      return start >= citaStart && start < citaEnd;
    });

    const slotEnd = new Date(
      start.getTime() + procedimiento.duracion_min * 60000
    );
    const isLongEnough = disponibilidad.bloques.some((bloque) => {
      const blockStart = new Date(bloque.start);
      const blockEnd = new Date(bloque.end);
      return start >= blockStart && slotEnd <= blockEnd;
    });

    const isPast = new Date() > start;

    if (isSlotAvailable && !isSlotBooked && isLongEnough && !isPast) {
      setFechaHoraSeleccionada(start.toISOString());
      showMessage(
        `✅ Has seleccionado: ${moment(start).format("LLL")}`,
        "success"
      );
      setPendingEvent({
        title: "Pendiente",
        start,
        end: slotEnd,
      });
    } else {
      setFechaHoraSeleccionada(null);
      showMessage(
        "❌ El horario seleccionado no está disponible.",
        "error",
        true
      );
      setPendingEvent(null);
    }
  };

  const handleModalConfirmation = () => {
    if (modalDate && modalTime) {
      const selectedDateTime = moment(`${modalDate} ${modalTime}`).toDate();
      handleSelectSlot({ start: selectedDateTime });
      handleCloseModal();
    } else {
      setMensaje("❌ Por favor, ingresa una fecha y hora válidas.");
    }
  };

  const reservedEvents = disponibilidad.citas
    .filter((cita) => new Date(cita.end) > new Date())
    .map((cita) => ({
      start: new Date(cita.start),
      end: new Date(cita.end),
      title: "Reservado",
    }));

  const allEvents = pendingEvent
    ? [...reservedEvents, pendingEvent]
    : reservedEvents;

  return (
    <div className="d-flex vh-100 bg-light font-sans">
      <Sidebar userRole="paciente" />
      <main className="flex-grow-1 p-3 overflow-auto">
        <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
          <h2>Reservar nueva cita</h2>
          <p>Paciente: {user?.name || "Paciente"}</p>

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

          {procedimiento && (
            <div>
              <h3>2. Elige un doctor</h3>
              <DoctoresList
                doctores={doctores}
                onSelect={setDoctorSeleccionado}
              />
            </div>
          )}

          {procedimiento && doctorSeleccionado && (
            <div>
              <h3>3. Elige fecha y hora</h3>
              <p>
                Puedes seleccionar una hora en el calendario o usar la opción
                manual.
              </p>
              <Button
                variant="primary"
                onClick={handleShowModal}
                style={{ marginBottom: "1rem" }}
              >
                Elegir momento de reserva
              </Button>
              {loading ? (
                <p>Cargando horarios disponibles...</p>
              ) : (
                <div>
                  {disponibilidad.bloques.length > 0 ? (
                    <Calendar
                      localizer={localizer}
                      events={allEvents}
                      defaultView="week"
                      views={["week", "day"]}
                      selectable
                      onSelectSlot={handleSelectSlot}
                      style={{ height: 800 }}
                      step={procedimiento.duracion_min}
                      min={moment().startOf("day").toDate()}
                      max={moment().endOf("day").toDate()}
                      slotPropGetter={(date) => {
                        const isAvailable = disponibilidad.bloques.some(
                          (bloque) => {
                            const start = new Date(bloque.start);
                            const end = new Date(bloque.end);
                            return date >= start && date < end;
                          }
                        );
                        const isPast = date < new Date();
                        if (!isAvailable || isPast) {
                          return {
                            style: { backgroundColor: "#EBEBEB", opacity: 0.7 },
                          };
                        }
                        return { style: { backgroundColor: "#FFFFFF" } };
                      }}
                      eventPropGetter={(event) => {
                        if (event.title === "Pendiente") {
                          return {
                            style: {
                              backgroundColor: "#90CAF9",
                              borderRadius: "4px",
                              opacity: 0.9,
                              color: "#333333",
                              border: "1px solid #42A5F5",
                              display: "block",
                              padding: "2px 5px",
                            },
                          };
                        }
                        return {
                          style: {
                            backgroundColor: "#F8BBD0",
                            borderRadius: "4px",
                            opacity: 0.9,
                            color: "#333333",
                            border: "1px solid #F06292",
                            display: "block",
                            padding: "2px 5px",
                          },
                        };
                      }}
                    />
                  ) : (
                    <p>No hay horarios disponibles para este doctor.</p>
                  )}
                </div>
              )}
            </div>
          )}

          {procedimiento && doctorSeleccionado && (
            <button
              onClick={handleReserva}
              disabled={!fechaHoraSeleccionada || loading}
              style={{
                marginTop: "1rem",
                backgroundColor: fechaHoraSeleccionada ? "#27ae60" : "#cccccc",
                color: "white",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "5px",
                cursor: fechaHoraSeleccionada ? "pointer" : "not-allowed",
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

          <Modal show={showModal} onHide={handleCloseModal}>
            <Modal.Header closeButton>
              <Modal.Title>Elegir Fecha y Hora</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control
                    type="date"
                    value={modalDate}
                    onChange={(e) => setModalDate(e.target.value)}
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Hora</Form.Label>
                  <Form.Control
                    type="time"
                    value={modalTime}
                    onChange={(e) => setModalTime(e.target.value)}
                  />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={handleModalConfirmation}>
                Seleccionar
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={showSuccessModal} onHide={handleCloseSuccessModal}>
            <Modal.Header closeButton>
              <Modal.Title>Cita Solicitada</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center">
              <h5>¡Tu cita se ha solicitado con éxito!</h5>
              <p>Te redirigiremos a tu dashboard.</p>
            </Modal.Body>
            <Modal.Footer className="justify-content-center">
              <Button variant="primary" onClick={handleCloseSuccessModal}>
                OK
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </main>
    </div>
  );
}
