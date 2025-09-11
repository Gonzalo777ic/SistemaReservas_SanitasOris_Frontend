import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Form,
  Modal,
  Row,
  Spinner,
  Table,
} from "react-bootstrap";
import { MdAdd, MdDelete, MdEdit } from "react-icons/md";
import Select from "react-select";
import Sidebar from "../components/Sidebar";
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
    imagen: null,
    doctores: [],
  });

  // Transforma los datos de los doctores para que sean compatibles con react-select
  const doctorOptions = doctores.map((d) => ({
    value: d.id,
    label: `${d.nombre} - ${d.especialidad}`,
  }));

  const handleSelectChange = (selectedOptions) => {
    // selectedOptions es un array de objetos { value, label }
    const selectedDoctorIds = selectedOptions.map((option) => option.value);
    setFormData({
      ...formData,
      doctores: selectedDoctorIds,
    });
  };

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });

      // Fetch all procedures
      const procedimientosRes = await api.get("procedimientos/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProcedimientos(procedimientosRes.data);

      // Fetch all doctors
      const doctoresRes = await api.get("doctores/", {
        headers: { Authorization: `Bearer ${token}` },
      });
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
      imagen: null,
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
    const { name, value, type, checked, files, options } = e.target;

    if (name === "doctores") {
      // Logic to handle multi-select input for doctors
      const selectedOptions = Array.from(options)
        .filter((option) => option.selected)
        .map((option) => parseInt(option.value, 10));

      setFormData({
        ...formData,
        [name]: selectedOptions,
      });
    } else {
      // Logic for all other input types
      setFormData({
        ...formData,
        [name]:
          type === "checkbox" ? checked : type === "file" ? files[0] : value,
      });
    }
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
      fetchAllData();
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
      fetchAllData();
    } catch (err) {
      console.error("Error al eliminar el procedimiento:", err);
      setError("Error al eliminar el procedimiento.");
      setLoading(false);
    }
  };

  return (
    <div className="d-flex vh-100 bg-light font-sans">
      <style>
        {`
            .font-sans { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
            .image-preview {
                max-width: 100px;
                max-height: 100px;
                object-fit: contain;
            }
            .image-preview-modal {
                max-width: 2500px;
                max-height: 2500px;
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

        <Card className="shadow-sm">
          <Card.Body>
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
              <Table striped bordered hover responsive>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Duración (min)</th>
                    <th>Doctores</th>
                    <th>Activo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {procedimientos.length > 0 ? (
                    procedimientos.map((p) => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>
                          {p.imagen && (
                            <img
                              src={p.imagen}
                              alt={p.nombre}
                              className="image-preview"
                            />
                          )}
                        </td>
                        <td>{p.nombre}</td>
                        <td>{p.descripcion}</td>
                        <td>{p.duracion_min}</td>
                        <td>
                          {p.doctores_nombres?.length > 0
                            ? p.doctores_nombres.join(", ")
                            : "Ninguno"}
                        </td>
                        <td>{p.activo ? "Sí" : "No"}</td>
                        <td>
                          <Button
                            variant="info"
                            size="sm"
                            className="me-2"
                            onClick={() => handleOpenModal(p)}
                          >
                            <MdEdit />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDelete(p.id)}
                          >
                            <MdDelete />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="text-center text-muted">
                        No hay procedimientos registrados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>
      </Container>

      {/* Modal for Creating/Editing Procedure */}
      <Modal size="xl" show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {isEditing ? "Editar Procedimiento" : "Nuevo Procedimiento"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Duración (minutos)</Form.Label>
              <Form.Control
                type="number"
                name="duracion_min"
                value={formData.duracion_min}
                onChange={handleChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Activo"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Doctores que realizan este procedimiento</Form.Label>
              <Select
                isMulti
                name="doctores"
                options={doctorOptions}
                className="basic-multi-select"
                classNamePrefix="select"
                onChange={handleSelectChange}
                value={doctorOptions.filter((option) =>
                  formData.doctores.includes(option.value)
                )}
              />
              <Form.Text className="text-muted">
                Selecciona o elimina doctores de la lista.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Imagen</Form.Label>
              <Form.Control type="file" name="imagen" onChange={handleChange} />
            </Form.Group>

            {isEditing && currentProcedimiento?.imagen && (
              <div className="mb-3 text-center">
                <p className="mb-1">Imagen actual:</p>
                <img
                  src={currentProcedimiento.imagen}
                  alt="Actual"
                  className="image-preview-modal border rounded"
                />
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Guardar
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
