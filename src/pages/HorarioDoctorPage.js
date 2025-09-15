// src/pages/HorarioDoctorPage.js

import { useAuth0 } from "@auth0/auth0-react";
import "bootstrap/dist/css/bootstrap.min.css";
import { useCallback, useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import HorarioCalendar from "../components/doctor/horarios/HorarioCalendar";
import HorarioConfirmationModals from "../components/doctor/horarios/HorarioConfirmationModals";
import HorarioForms from "../components/doctor/horarios/HorarioForms";
import HorarioTable from "../components/doctor/horarios/HorarioTable";
import HorarioTemplates from "../components/doctor/horarios/HorarioTemplates";
import { api } from "../services/api";
import "./styles.css";

// Mueve esto al componente donde se use (HorarioForms, HorarioTable)
export const DIAS_SEMANA_MAP = [
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
  const [showAddEditModal, setShowAddEditModal] = useState(false); // Renamed for clarity
  const [currentEdit, setCurrentEdit] = useState(null);
  const [form, setForm] = useState({
    dia_semana: 0,
    hora_inicio: "",
    hora_fin: "",
  });

  // Template States
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false); // Renamed
  const [templateName, setTemplateName] = useState("");
  const [savedSchedules, setSavedSchedules] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  // Delete Confirmation States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [horarioToDelete, setHorarioToDelete] = useState(null);

  // --- Fetch Doctor ID ---
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

  useEffect(() => {
    fetchDoctorId();
  }, [fetchDoctorId]);

  // --- Fetch Schedules and Templates ---
  const fetchHorariosAndTemplates = useCallback(async () => {
    if (!doctorId) return;
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        },
      });
      const horariosRes = await api.get(`horarios/?doctor_id=${doctorId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setHorarios(horariosRes.data);

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
  }, [doctorId, getAccessTokenSilently]);

  useEffect(() => {
    fetchHorariosAndTemplates();
  }, [fetchHorariosAndTemplates]);

  // --- CRUD Handlers for individual schedules ---
  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveHorario = async (e) => {
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
          { ...form, doctor_id: doctorId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setHorarios(
          horarios.map((h) => (h.id === currentEdit.id ? res.data : h))
        );
      } else {
        res = await api.post(
          "horarios/",
          { ...form, doctor_id: doctorId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setHorarios([...horarios, res.data]);
      }
      handleCloseAddEditModal();
    } catch (err) {
      console.error("Error al guardar horario:", err.response?.data || err);
    }
  };

  const handleConfirmDeleteHorario = async () => {
    if (!horarioToDelete) return;

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });

      await api.put(
        `horarios/${horarioToDelete.id}/`,
        { ...horarioToDelete, doctor_id: doctorId, activo: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setHorarios(horarios.filter((h) => h.id !== horarioToDelete.id));
      console.log("Horario eliminado del front (soft delete en DB)");
    } catch (err) {
      console.error("Error al desactivar horario:", err.response?.data || err);
    } finally {
      setShowDeleteModal(false);
      setHorarioToDelete(null);
    }
  };

  const handleToggleActive = async (horario) => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });

      const res = await api.put(
        `horarios/${horario.id}/`,
        { ...horario, doctor_id: doctorId, activo: !horario.activo },
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

  // --- Template Handlers ---
  const handleSaveTemplate = async () => {
    if (!templateName || !doctorId || horarios.length === 0) {
      console.error(
        "No se puede guardar la plantilla. Asegúrate de tener un nombre y horarios definidos."
      );
      return;
    }
    const horariosActivos = horarios.filter((h) => h.activo);
    if (horariosActivos.length === 0) {
      console.error("No hay horarios activos para guardar.");
      return;
    }

    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });
      await api.post(
        "horarios-semanales/",
        {
          nombre: templateName,
          doctor: doctorId,
          items: horariosActivos,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowSaveTemplateModal(false);
      setTemplateName("");
      fetchHorariosAndTemplates(); // Re-fetch templates to update list
      console.log(`Plantilla "${templateName}" guardada con éxito.`);
    } catch (err) {
      console.error(
        "Error al guardar la plantilla:",
        err.response?.data || err
      );
    }
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return;
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });
      const res = await api.post(
        `horarios-semanales/${selectedTemplate}/aplicar_a_doctor/`,
        { doctor_id: doctorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setHorarios(res.data.horarios_actualizados);
      console.log(`Plantilla aplicada con éxito.`);
    } catch (err) {
      console.error(
        "Error al aplicar la plantilla:",
        err.response?.data || err
      );
    }
  };

  const handleActivateTemplate = async () => {
    if (!selectedTemplate) return;
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });
      await api.post(
        `horarios-semanales/${selectedTemplate}/activar/`,
        { doctor_id: doctorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchHorariosAndTemplates(); // Re-fetch templates to update active marker
      console.log(`Plantilla activada con éxito.`);
    } catch (err) {
      console.error(
        "Error al activar la plantilla:",
        err.response?.data || err
      );
    }
  };

  // --- Modal Control Functions ---
  const handleOpenAddEditModal = (horario = null, slotInfo = null) => {
    if (horario) {
      // Logic for editing an existing schedule
      setCurrentEdit(horario);
      setForm({
        dia_semana: horario.dia_semana,
        hora_inicio: horario.hora_inicio,
        hora_fin: horario.hora_fin,
      });
    } else if (slotInfo) {
      // Logic for adding a new schedule from the calendar
      setCurrentEdit(null);
      // Format the dates to "HH:mm" strings
      const diaSemana =
        slotInfo.start.getDay() === 0 ? 6 : slotInfo.start.getDay() - 1;
      const horaInicio = slotInfo.start.toTimeString().slice(0, 5);
      const horaFin = slotInfo.end.toTimeString().slice(0, 5);
      setForm({
        dia_semana: diaSemana,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
      });
    } else {
      // Logic for adding a new schedule from the button
      setCurrentEdit(null);
      setForm({ dia_semana: 0, hora_inicio: "", hora_fin: "" });
    }
    setShowAddEditModal(true);
  };

  const handleCloseAddEditModal = () => {
    setShowAddEditModal(false);
    setCurrentEdit(null);
    setForm({ dia_semana: 0, hora_inicio: "", hora_fin: "" });
  };

  const handleOpenDeleteModal = (horario) => {
    setHorarioToDelete(horario);
    setShowDeleteModal(true);
  };

  return (
    <div className="d-flex vh-100 bg-light font-sans">
      <Sidebar userRole="doctor" />
      <main className="flex-grow-1 p-3 overflow-auto">
        <h2 className="text-secondary fw-bold mb-4">
          Gestionar Horario de Disponibilidad
        </h2>

        {/* Calendar Section */}
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <HorarioCalendar
              horarios={horarios}
              onSelectSlot={(slotInfo) =>
                handleOpenAddEditModal(null, slotInfo)
              }
              onSelectEvent={(event) => {
                const horario = horarios.find((h) => h.id === event.resourceId);
                if (horario) {
                  handleOpenAddEditModal(horario);
                }
              }}
              onAddHorarioClick={handleOpenAddEditModal}
            />
          </Card.Body>
        </Card>

        {/* Template Management Section */}
        <HorarioTemplates
          savedSchedules={savedSchedules}
          selectedTemplate={selectedTemplate}
          setSelectedTemplate={setSelectedTemplate}
          onSaveTemplateClick={() => setShowSaveTemplateModal(true)}
          onApplyTemplate={handleApplyTemplate}
          onActivateTemplate={handleActivateTemplate}
        />

        {/* Schedule Table Section */}
        <Card className="shadow-sm mt-4">
          <Card.Body>
            <HorarioTable
              horarios={horarios}
              onEdit={handleOpenAddEditModal}
              onDelete={handleOpenDeleteModal}
              onToggleActive={handleToggleActive}
            />
          </Card.Body>
        </Card>

        {/* Modals */}
        <HorarioForms
          show={showAddEditModal}
          onHide={handleCloseAddEditModal}
          form={form}
          handleInputChange={handleInputChange}
          handleSubmit={handleSaveHorario}
          currentEdit={currentEdit}
        />

        <HorarioConfirmationModals
          showSaveTemplateModal={showSaveTemplateModal}
          setShowSaveTemplateModal={setShowSaveTemplateModal}
          templateName={templateName}
          setTemplateName={setTemplateName}
          handleSaveTemplate={handleSaveTemplate}
          showDeleteModal={showDeleteModal}
          setShowDeleteModal={setShowDeleteModal}
          handleConfirmDeleteHorario={handleConfirmDeleteHorario}
        />
      </main>
    </div>
  );
}
