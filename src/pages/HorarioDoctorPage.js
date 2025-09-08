import { useAuth0 } from "@auth0/auth0-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { addDays, format, getDay, parse, startOfWeek } from "date-fns";
import { es } from "date-fns/locale";
import { useCallback, useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button, Card, Col, Form, Modal, Row, Table } from "react-bootstrap";
import {
  MdAddCircle,
  MdDelete,
  MdEdit,
  MdRefresh,
  MdSave,
} from "react-icons/md";
import { api } from "../services/api";

// Configuración de locales para date-fns
const locales = { "es-ES": es };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { locale: es, weekStartsOn: 1 }), // Lunes
  getDay,
  locales,
});

const DIAS_SEMANA_MAP = [
  { value: 0, label: "Lunes" },
  { value: 1, label: "Martes" },
  { value: 2, label: "Miércoles" },
  { value: 3, label: "Jueves" },
  { value: 4, label: "Viernes" },
  { value: 5, label: "Sábado" },
  { value: 6, label: "Domingo" },
];

export default function HorarioDoctorPage() {
  const { user, getAccessTokenSilently } = useAuth0();
  const [doctorId, setDoctorId] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [form, setForm] = useState({
    dia_semana: 0,
    hora_inicio: "",
    hora_fin: "",
  });
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [savedSchedules, setSavedSchedules] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const fetchDoctorId = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        },
      });
      const res = await api.get("doctores/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const doctor = res.data.find(
        (d) => d.user?.email === user.email || d.email === user.email
      );
      if (doctor) setDoctorId(doctor.id);
    } catch (err) {
      console.error("Error al obtener doctor:", err);
    }
  }, [getAccessTokenSilently, user.email]);

  // Hook para obtener el ID del doctor
  useEffect(() => {
    fetchDoctorId();
  }, [fetchDoctorId]);

  // Hook para obtener los horarios y las plantillas
  useEffect(() => {
    const fetchHorarios = async () => {
      if (!doctorId) return;
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: process.env.REACT_APP_AUTH0_AUDIENCE,
          },
        });
        // Obtener horarios individuales del doctor
        const horariosRes = await api.get(`horarios/?doctor_id=${doctorId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHorarios(horariosRes.data);

        // OBTENER LAS PLANTILLAS DE HORARIOS GUARDADAS REALMENTE
        const savedTemplatesRes = await api.get(
          `horarios-semanales/?doctor_id=${doctorId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setSavedSchedules(savedTemplatesRes.data);
      } catch (err) {
        console.error("Error al obtener datos:", err);
      }
    };
    fetchHorarios();
  }, [doctorId, getAccessTokenSilently]);

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctorId || !form.hora_inicio || !form.hora_fin) {
      console.error("Por favor, complete todos los campos.");
      return;
    }

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });
      let res;
      if (currentEdit) {
        res = await api.put(
          `horarios/${currentEdit.id}/`,
          {
            ...form,
            doctor_id: doctorId,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setHorarios(
          horarios.map((h) => (h.id === currentEdit.id ? res.data : h))
        );
      } else {
        res = await api.post(
          "horarios/",
          { ...form, doctor_id: doctorId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setHorarios([...horarios, res.data]);
      }
      handleCloseModal();
    } catch (err) {
      console.error("Error al guardar horario:", err.response?.data || err);
    }
  };

  const handleSaveTemplate = async () => {
    // LLAMADA REAL PARA GUARDAR LA PLANTILLA
    if (!templateName || !doctorId || horarios.length === 0) {
      console.error(
        "No se puede guardar la plantilla. Asegúrate de tener un nombre y horarios definidos."
      );
      return;
    }
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });
      // El backend manejará la lógica de crear la plantilla y sus items
      await api.post(
        "horarios-semanales/",
        {
          nombre: templateName,
          doctor: doctorId,
          items: horarios,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowSaveModal(false);
      setTemplateName("");
      // Recargar la lista de plantillas guardadas
      const savedTemplatesRes = await api.get(
        `horarios-semanales/?doctor_id=${doctorId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSavedSchedules(savedTemplatesRes.data);
      console.log(`Plantilla "${templateName}" guardada con éxito.`);
    } catch (err) {
      console.error(
        "Error al guardar la plantilla:",
        err.response?.data || err
      );
    }
  };

  const handleApplyTemplate = async () => {
    // LLAMADA REAL PARA APLICAR LA PLANTILLA
    if (!selectedTemplate) return;

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });

      // El backend limpiará los horarios actuales y los reemplazará con los de la plantilla
      const res = await api.post(
        `horarios-semanales/${selectedTemplate}/aplicar_a_doctor/`,
        { doctor_id: doctorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Actualizar el estado de horarios con los datos nuevos devueltos por la API
      setHorarios(res.data.horarios_actualizados);
      console.log(`Plantilla aplicada con éxito.`);
    } catch (err) {
      console.error(
        "Error al aplicar la plantilla:",
        err.response?.data || err
      );
    }
  };

  const handleSelectSlot = ({ start, end, slots }) => {
    const dia_semana = (getDay(start) + 6) % 7;
    setForm({
      dia_semana,
      hora_inicio: format(start, "HH:mm"),
      hora_fin: format(end, "HH:mm"),
    });
    setCurrentEdit(null);
    setShowModal(true);
  };

  const handleEdit = (horario) => {
    setCurrentEdit(horario);
    setForm({
      dia_semana: horario.dia_semana,
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin,
    });
    setShowModal(true);
  };

  const handleEliminar = async (id) => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });
      await api.delete(`horarios/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHorarios(horarios.filter((h) => h.id !== id));
    } catch (err) {
      console.error("Error al eliminar horario:", err);
    }
  };

  const handleToggleActive = async (horario) => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });
      const res = await api.put(
        `horarios/${horario.id}/`,
        // Evitamos el operador de propagación para un control estricto de los campos
        {
          doctor_id: horario.doctor_id,
          dia_semana: horario.dia_semana,
          hora_inicio: horario.hora_inicio,
          hora_fin: horario.hora_fin,
          activo: !horario.activo,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHorarios(horarios.map((h) => (h.id === horario.id ? res.data : h)));
    } catch (err) {
      console.error(
        "Error al actualizar el estado del horario:",
        err.response?.data || err
      );
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentEdit(null);
    setForm({ dia_semana: 0, hora_inicio: "", hora_fin: "" });
  };

  // Filtrar los horarios para que el calendario solo muestre los que están activos
  const calendarEvents = horarios
    .filter((h) => h.activo)
    .map((h) => {
      const today = new Date();
      const startOfWeekDay = startOfWeek(today, {
        locale: es,
        weekStartsOn: 1,
      });
      const eventDay = addDays(startOfWeekDay, h.dia_semana);
      const [startHour, startMinute] = h.hora_inicio.split(":").map(Number);
      const [endHour, endMinute] = h.hora_fin.split(":").map(Number);

      const start = new Date(
        eventDay.getFullYear(),
        eventDay.getMonth(),
        eventDay.getDate(),
        startHour,
        startMinute
      );
      const end = new Date(
        eventDay.getFullYear(),
        eventDay.getMonth(),
        eventDay.getDate(),
        endHour,
        endMinute
      );

      return {
        title: `${h.hora_inicio} - ${h.hora_fin}`,
        start: start,
        end: end,
        resourceId: h.id,
      };
    });

  return (
    <div className="p-4 bg-light min-vh-100">
      <h2 className="text-secondary fw-bold mb-4">
        Gestionar Horario de Disponibilidad
      </h2>

      {/* Tarjeta para el calendario */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title fw-semibold text-primary">
              Vista Semanal
            </h5>
            <Button
              variant="outline-primary"
              onClick={() => setShowModal(true)}
            >
              <MdAddCircle className="me-2" />
              Añadir Horario
            </Button>
          </div>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={(event) => {
              const horario = horarios.find((h) => h.id === event.resourceId);
              if (horario) {
                handleEdit(horario);
              }
            }}
            style={{ height: 600 }}
            views={["week", "day"]}
            defaultView="week"
          />
        </Card.Body>
      </Card>

      {/* Botones para guardar y cargar plantillas */}
      <div className="d-flex justify-content-center gap-3 mb-4">
        <Button variant="success" onClick={() => setShowSaveModal(true)}>
          <MdSave className="me-2" />
          Guardar como Plantilla
        </Button>
        <Form.Select
          style={{ width: "250px" }}
          value={selectedTemplate}
          onChange={(e) => setSelectedTemplate(e.target.value)}
        >
          <option value="">Cargar horario guardado...</option>
          {savedSchedules.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </Form.Select>
        <Button
          variant="secondary"
          onClick={handleApplyTemplate}
          disabled={!selectedTemplate}
        >
          <MdRefresh className="me-2" />
          Aplicar
        </Button>
      </div>

      {/* Tarjeta para la tabla de horarios */}
      <Card className="shadow-sm">
        <Card.Body>
          <h5 className="card-title fw-semibold text-primary mb-3">
            Mis Horarios
          </h5>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Día</th>
                <th>Hora Inicio</th>
                <th>Hora Fin</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {horarios.map((horario) => (
                <tr key={horario.id}>
                  <td>
                    {
                      DIAS_SEMANA_MAP.find(
                        (d) => d.value === horario.dia_semana
                      )?.label
                    }
                  </td>
                  <td>{horario.hora_inicio}</td>
                  <td>{horario.hora_fin}</td>
                  <td>
                    <Button
                      variant={
                        horario.activo ? "outline-secondary" : "outline-success"
                      }
                      size="sm"
                      onClick={() => handleToggleActive(horario)}
                    >
                      {horario.activo ? "Ocultar" : "Mostrar"}
                    </Button>
                  </td>
                  <td>
                    <Button
                      variant="outline-secondary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleEdit(horario)}
                    >
                      <MdEdit />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleEliminar(horario.id)}
                    >
                      <MdDelete />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Modal para añadir/editar horarios */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {currentEdit ? "Editar Horario" : "Añadir Nuevo Horario"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Día de la semana</Form.Label>
              <Form.Control
                as="select"
                name="dia_semana"
                value={form.dia_semana}
                onChange={handleInputChange}
              >
                {DIAS_SEMANA_MAP.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Hora de inicio</Form.Label>
                  <Form.Control
                    type="time"
                    name="hora_inicio"
                    value={form.hora_inicio}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Hora de fin</Form.Label>
                  <Form.Control
                    type="time"
                    name="hora_fin"
                    value={form.hora_fin}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end">
              <Button variant="primary" type="submit">
                {currentEdit ? "Guardar Cambios" : "Guardar Horario"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal para guardar la plantilla */}
      <Modal show={showSaveModal} onHide={() => setShowSaveModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Guardar Horario como Plantilla</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de la plantilla</Form.Label>
              <Form.Control
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Ej. Horario de Verano"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSaveModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveTemplate}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
