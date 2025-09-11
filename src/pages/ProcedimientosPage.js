// src/pages/ProcedimientosPage.js

import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Container, Row, Spinner } from "react-bootstrap";
import { MdAdd } from "react-icons/md";
import Sidebar from "../components/Sidebar";
import ProcedimientoFormModal from "../components/admin/procedimientos/ProcedimientoFormModal"; // New
import ProcedimientosTable from "../components/admin/procedimientos/ProcedimientosTable"; // New
import { api } from "../services/api";
import "./styles.css";

export default function ProcedimientosPage() {
  const { getAccessTokenSilently } = useAuth0();
  const [procedimientos, setProcedimientos] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentProcedimiento, setCurrentProcedimiento] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    duracion_min: 0,
    activo: true,
    imagen: null, // File object for new image upload
    doctores: [], // Array of doctor IDs
  });

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });

      const [procedimientosRes, doctoresRes] = await Promise.all([
        api.get("procedimientos/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        api.get("doctores/", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setProcedimientos(procedimientosRes.data);
      setDoctores(doctoresRes.data);
      setLoading(false);
    } catch (err) {
      console.error("Error al cargar los datos:", err);
      setError("Error al cargar los procedimientos y doctores.");
      setLoading(false);
    }
  }, [getAccessTokenSilently]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleOpenModal = (procedimiento = null) => {
    const isEditingMode = !!procedimiento;
    setIsEditing(isEditingMode);
    setCurrentProcedimiento(procedimiento);

    setFormData({
      nombre: procedimiento?.nombre || "",
      descripcion: procedimiento?.descripcion || "",
      duracion_min: procedimiento?.duracion_min || 30,
      activo: procedimiento?.activo ?? true,
      imagen: null, // Reset image input when opening modal
      doctores: procedimiento?.doctores || [],
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({
      nombre: "",
      descripcion: "",
      duracion_min: 30,
      activo: true,
      imagen: null,
      doctores: [],
    });
    setCurrentProcedimiento(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    });
  };

  const handleSelectChange = (selectedOptions) => {
    const selectedDoctorIds = selectedOptions.map((option) => option.value);
    setFormData({
      ...formData,
      doctores: selectedDoctorIds,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });

      const dataToSubmit = new FormData();
      dataToSubmit.append("nombre", formData.nombre);
      dataToSubmit.append("descripcion", formData.descripcion);
      dataToSubmit.append("duracion_min", formData.duracion_min);
      dataToSubmit.append("activo", formData.activo);
      if (formData.imagen) {
        dataToSubmit.append("imagen", formData.imagen);
      }
      formData.doctores.forEach((doctorId) => {
        dataToSubmit.append("doctores", doctorId);
      });

      if (isEditing) {
        await api.put(
          `procedimientos/${currentProcedimiento.id}/`,
          dataToSubmit,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else {
        await api.post("procedimientos/", dataToSubmit, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }
      handleCloseModal();
      fetchAllData(); // Refresh data
    } catch (err) {
      console.error("Error al guardar el procedimiento:", err);
      setError("Error al guardar el procedimiento.");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "¿Estás seguro de que quieres eliminar este procedimiento?"
      )
    )
      return;
    setLoading(true);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });
      await api.delete(`procedimientos/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAllData(); // Refresh data
    } catch (err) {
      console.error("Error al eliminar el procedimiento:", err);
      setError("Error al eliminar el procedimiento.");
      setLoading(false);
    }
  };

  // Transforma los datos de los doctores para que sean compatibles con react-select
  const doctorOptions = doctores.map((d) => ({
    value: d.id,
    label: `${d.nombre} - ${d.especialidad}`,
  }));

  return (
    <div className="d-flex vh-100 bg-light font-sans">
      {/* CSS Styles - Consider moving this to a dedicated CSS file if used across components, or a utility file. */}
      <style>
        {`
            .font-sans { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
            .image-preview {
                max-width: 100px;
                max-height: 100px;
                object-fit: contain;
            }
            .image-preview-modal {
                max-width: 2500px; /* Reduced for practicality in modal */
                max-height: 2500px; /* Reduced for practicality in modal */
                object-fit: contain;
            }
            `}
      </style>
      <Sidebar userRole="admin" />
      <Container fluid className="p-4 overflow-auto">
        <Row className="mb-4">
          <Col>
            <h1 className="h4 fw-bold text-dark">Gestión de Procedimientos</h1>
            <p className="text-secondary">
              Administra los procedimientos que pueden ser ofrecidos por los
              doctores.
            </p>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col className="text-end">
            <Button variant="primary" onClick={() => handleOpenModal()}>
              <MdAdd className="me-1" /> Nuevo Procedimiento
            </Button>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center p-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-primary">Cargando procedimientos...</p>
          </div>
        ) : error ? (
          <Alert variant="danger" className="text-center">
            {error}
          </Alert>
        ) : (
          <ProcedimientosTable
            procedimientos={procedimientos}
            onEdit={handleOpenModal}
            onDelete={handleDelete}
          />
        )}
      </Container>

      <ProcedimientoFormModal
        show={showModal}
        onHide={handleCloseModal}
        isEditing={isEditing}
        currentProcedimiento={currentProcedimiento}
        formData={formData}
        handleChange={handleChange}
        handleSelectChange={handleSelectChange}
        handleSubmit={handleSubmit}
        doctorOptions={doctorOptions}
      />
    </div>
  );
}
