import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  Col,
  Container,
  Row,
  Spinner,
} from "react-bootstrap";
import { MdAdd, MdRemove } from "react-icons/md";
import Sidebar from "../components/Sidebar";
import { api } from "../services/api";
import "./styles.css";

export default function ProcedimientosDoctorPage() {
  const { user, getAccessTokenSilently } = useAuth0();
  const [allProcedimientos, setAllProcedimientos] = useState([]);
  const [myProcedimientos, setMyProcedimientos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchProcedimientos = useCallback(async () => {
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });

      // Fetch all available procedures
      const allRes = await api.get("procedimientos/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllProcedimientos(allRes.data.filter((p) => p.activo));

      // Fetch the doctor's specific procedures
      const doctorRes = await api.get(`doctores/by_email/${user.email}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyProcedimientos(doctorRes.data.procedimientos);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        "Error al cargar los procedimientos. Por favor, inténtelo de nuevo."
      );
    } finally {
      setLoading(false);
    }
  }, [getAccessTokenSilently, user]);

  useEffect(() => {
    fetchProcedimientos();
  }, [fetchProcedimientos]);

  const handleAddProcedimiento = (proc) => {
    if (!myProcedimientos.some((p) => p.id === proc.id)) {
      setMyProcedimientos([...myProcedimientos, proc]);
    }
  };

  const handleRemoveProcedimiento = (procId) => {
    setMyProcedimientos(myProcedimientos.filter((p) => p.id !== procId));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });
      const doctorRes = await api.get(`doctores/by_email/${user.email}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const doctorId = doctorRes.data.id;

      const selectedIds = myProcedimientos.map((p) => p.id);

      await api.patch(
        `doctores/${doctorId}/procedimientos-personalizados/`,
        { procedimientos: selectedIds },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      alert("Procedimientos actualizados correctamente.");
    } catch (err) {
      console.error("Error al guardar:", err);
      setError("Error al guardar los cambios.");
    } finally {
      setIsSaving(false);
    }
  };

  const availableProcedimientos = allProcedimientos.filter(
    (p) => !myProcedimientos.some((mp) => mp.id === p.id)
  );

  return (
    <div className="d-flex vh-100 bg-light font-sans">
      <Sidebar userRole="doctor" />
      <Container fluid className="p-4 overflow-auto">
        <Row className="mb-4">
          <Col>
            <h1 className="h4 fw-bold text-dark">Mis Procedimientos</h1>
            <p className="text-secondary">
              Selecciona los procedimientos que realizas en la clínica.
            </p>
          </Col>
        </Row>
        <Row className="mb-3">
          <Col className="text-end">
            <Button variant="success" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Guardando...
                </>
              ) : (
                "Guardar Cambios"
              )}
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
          <Row className="g-4">
            <Col md={6}>
              <Card className="shadow-sm">
                <Card.Header className="fw-bold">
                  Procedimientos Disponibles
                </Card.Header>
                <Card.Body style={{ maxHeight: "600px", overflowY: "auto" }}>
                  {availableProcedimientos.length > 0 ? (
                    availableProcedimientos.map((proc) => (
                      <div
                        key={proc.id}
                        className="d-flex justify-content-between align-items-center border-bottom py-2"
                      >
                        <span>{proc.nombre}</span>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleAddProcedimiento(proc)}
                        >
                          <MdAdd />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted">
                      No hay más procedimientos disponibles.
                    </p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm">
                <Card.Header className="fw-bold">
                  Mis Procedimientos
                </Card.Header>
                <Card.Body style={{ maxHeight: "600px", overflowY: "auto" }}>
                  {myProcedimientos.length > 0 ? (
                    myProcedimientos.map((proc) => (
                      <div
                        key={proc.id}
                        className="d-flex justify-content-between align-items-center border-bottom py-2"
                      >
                        <span>{proc.nombre}</span>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemoveProcedimiento(proc.id)}
                        >
                          <MdRemove />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted">
                      Aún no has seleccionado procedimientos.
                    </p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}
