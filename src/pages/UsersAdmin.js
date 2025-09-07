import { useAuth0 } from "@auth0/auth0-react";
import { useCallback, useEffect, useState } from "react";
import {
  Button,
  Container,
  Form,
  InputGroup,
  Spinner,
  Table,
} from "react-bootstrap";
import { MdSearch } from "react-icons/md";
import Sidebar from "../components/Sidebar";

// Importa los estilos de Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";

export default function UsersAdmin() {
  const { getAccessTokenSilently } = useAuth0();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = useCallback(
    async (query = "") => {
      try {
        setLoading(true);
        setError(null);
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: process.env.REACT_APP_AUTH0_AUDIENCE,
          },
        });

        const url = `http://localhost:8000/api/users/?search=${encodeURIComponent(
          query
        )}`;
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        // Filtramos para no mostrar administradores para evitar errores
        const filteredData = data.filter((user) => user.role !== "admin");
        setUsers(filteredData);
      } catch (err) {
        console.error("❌ Error fetching users:", err);
        setError("No se pudo cargar la lista de usuarios.");
      } finally {
        setLoading(false);
      }
    },
    [getAccessTokenSilently]
  );

  useEffect(() => {
    fetchUsers(searchTerm);
  }, [fetchUsers, searchTerm]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const promoteToDoctor = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        },
      });

      const response = await fetch(
        `http://localhost:8000/api/users/${userId}/promote_to_doctor/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      fetchUsers(searchTerm);
    } catch (err) {
      console.error("❌ Error promoting user:", err);
      setError("No se pudo promover al usuario a doctor.");
    } finally {
      setLoading(false);
    }
  };

  // 🚨 Nueva función para degradar a un doctor a paciente
  const revertToPaciente = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        },
      });

      const response = await fetch(
        `http://localhost:8000/api/users/${userId}/revert_to_paciente/`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      fetchUsers(searchTerm);
    } catch (err) {
      console.error("❌ Error reverting user:", err);
      setError("No se pudo revertir el rol del usuario a paciente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex vh-100 bg-light font-sans">
      <Sidebar userRole="admin" />

      <main className="flex-grow-1 p-3 overflow-auto">
        <Container fluid>
          <div className="mb-4">
            <h1 className="h4 fw-bold text-dark">Gestión de Usuarios</h1>
            <p className="text-secondary">
              Promueve a pacientes a doctores y gestiona los roles del personal.
            </p>
          </div>

          <div className="card shadow-sm p-4">
            <div className="mb-3">
              <InputGroup>
                <Form.Control
                  placeholder="Buscar usuarios por nombre, apellido o email..."
                  onChange={handleSearchChange}
                  value={searchTerm}
                />
                <Button variant="outline-secondary">
                  <MdSearch />
                </Button>
              </InputGroup>
            </div>

            {loading ? (
              <div className="d-flex justify-content-center my-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </Spinner>
              </div>
            ) : error ? (
              <div className="alert alert-danger text-center">{error}</div>
            ) : (
              <Table striped bordered hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length > 0 ? (
                    users.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        {/* 🚨 Usamos first_name y last_name para mostrar el nombre completo */}
                        <td>
                          {user.first_name} {user.last_name}
                        </td>
                        <td>{user.email}</td>
                        <td>
                          <span
                            className={`badge ${
                              user.role === "doctor"
                                ? "bg-primary"
                                : "bg-success"
                            }`}
                          >
                            {user.role.charAt(0).toUpperCase() +
                              user.role.slice(1)}
                          </span>
                        </td>
                        <td>
                          {user.role === "paciente" && (
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => promoteToDoctor(user.id)}
                            >
                              Promover a Doctor
                            </Button>
                          )}
                          {/* 🚨 Botón para degradar a un doctor a paciente */}
                          {user.role === "doctor" && (
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => revertToPaciente(user.id)}
                            >
                              Degradar a Paciente
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-secondary">
                        No se encontraron usuarios.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </div>
        </Container>
      </main>
    </div>
  );
}
