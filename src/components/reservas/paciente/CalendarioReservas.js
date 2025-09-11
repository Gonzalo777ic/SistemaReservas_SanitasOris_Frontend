// src/components/reservas/paciente/CalendarioReservas.js

import moment from "moment";
import { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button, Form, Modal } from "react-bootstrap";
// Correct the import path for the CSS file
import "../../../pages/ReservasPacientePage.css"; // <--- CORRECTED PATH

const localizer = momentLocalizer(moment);

const CalendarioReservas = ({
  disponibilidad,
  procedimiento,
  loading,
  setFechaHoraSeleccionada,
  setPendingEvent,
  pendingEvent,
  showMessage,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [modalDate, setModalDate] = useState("");
  const [modalTime, setModalTime] = useState("");

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setModalDate("");
    setModalTime("");
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
        "success",
        true
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
      showMessage(
        "❌ Por favor, ingresa una fecha y hora válidas.",
        "error",
        true
      );
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
    <div>
      <p>
        Puedes seleccionar una hora en el calendario o usar la opción manual.
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
                const isAvailable = disponibilidad.bloques.some((bloque) => {
                  const start = new Date(bloque.start);
                  const end = new Date(bloque.end);
                  return date >= start && date < end;
                });
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
    </div>
  );
};

export default CalendarioReservas;
