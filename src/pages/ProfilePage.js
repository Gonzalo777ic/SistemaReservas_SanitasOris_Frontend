import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const ProfilePage = () => {
  const { user, getAccessTokenSilently } = useAuth0();
  const { role: userRole } = useOutletContext();
  const [profile, setProfile] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [procedimientos, setProcedimientos] = useState([]); // <-- Nuevo estado para procedimientos

  useEffect(() => {
    if (!user || !userRole) return;

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: process.env.REACT_APP_AUTH0_AUDIENCE,
          },
        });

        let apiUrl = "";
        if (userRole === "paciente") {
          apiUrl = "http://localhost:8000/api/pacientes/";
        } else if (userRole === "doctor") {
          // <-- Para doctores, usaremos la vista de doctores que incluye los procedimientos
          apiUrl = "http://localhost:8000/api/doctores/";
        } else if (userRole === "admin") {
          setProfile({
            user: {
              first_name: user.given_name || user.name?.split(" ")[0] || "",
              last_name:
                user.family_name ||
                user.name?.split(" ").slice(1).join(" ") ||
                "",
              email: user.email,
            },
            telefono: "",
          });
          setLoading(false);
          return;
        }

        const response = await axios.get(apiUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userProfile = response.data.find(
          (p) => p.user.email === user.email
        );

        if (userProfile) {
          setProfile(userProfile);
          setPhoneNumber(userProfile.telefono || "");
          if (userRole === "doctor") {
            setSpecialty(userProfile.especialidad || "");
            // <-- Guarda la lista de procedimientos
            setProcedimientos(userProfile.procedimientos || []);
          }
        } else {
          setMessage({
            text: "Perfil no encontrado en la base de datos.",
            type: "error",
          });
        }
      } catch (error) {
        console.error("Error al obtener el perfil:", error);
        setMessage({ text: "Error al cargar el perfil.", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user, userRole, getAccessTokenSilently]);

  const handleSaveProfile = async () => {
    if (!phoneNumber) {
      setMessage({
        text: "Por favor, introduce un número de teléfono.",
        type: "error",
      });
      return;
    }
    if (userRole === "doctor" && !specialty) {
      setMessage({
        text: "Por favor, introduce una especialidad.",
        type: "error",
      });
      return;
    }

    try {
      setIsSaving(true);
      const token = await getAccessTokenSilently({
        authorizationParams: { audience: process.env.REACT_APP_AUTH0_AUDIENCE },
      });

      const dataToUpdate = {
        telefono: phoneNumber,
      };

      if (userRole === "doctor") {
        dataToUpdate.especialidad = specialty;
      }

      await axios.patch(
        "http://localhost:8000/api/profile/update/",
        dataToUpdate,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsEditing(false);
      setProfile({
        ...profile,
        telefono: phoneNumber,
        especialidad: specialty,
      });
      setMessage({
        text: "Perfil guardado con éxito!",
        type: "success",
      });
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
      setMessage({
        text: "Error al guardar el perfil.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando perfil...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="alert alert-danger" role="alert">
          {message.text}
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar userRole={userRole} />
      <main className="flex-grow-1 p-3 overflow-auto">
        <div className="container py-5">
          <div className="card shadow-lg border-0">
            <div className="card-body p-4">
              <div className="row g-0">
                <div className="col-md-4 d-flex flex-column align-items-center justify-content-center p-3 text-center border-end">
                  <div className="profile-img-container mb-3">
                    <img
                      src={
                        user?.picture ||
                        "https://placehold.co/150x150/007bff/ffffff?text=User"
                      }
                      className="rounded-circle border border-5 border-primary shadow"
                      alt="Foto de perfil"
                      style={{ width: "150px", height: "150px" }}
                    />
                  </div>
                  <h4 className="card-title fw-bold mb-1">
                    {profile.user.first_name || "Usuario"}{" "}
                    {profile.user.last_name || ""}
                  </h4>
                  <p className="text-muted text-capitalize mb-0">{userRole}</p>
                </div>
                <div className="col-md-8 p-4">
                  <h5 className="mb-3 border-bottom pb-2">
                    Información del Perfil
                  </h5>
                  {message.text && (
                    <div
                      className={`alert text-center ${
                        message.type === "success"
                          ? "alert-success"
                          : "alert-danger"
                      }`}
                      role="alert"
                    >
                      {message.text}
                    </div>
                  )}
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Nombre</label>
                      <p className="card-text">
                        {profile.user.first_name || "N/A"}
                      </p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Apellido</label>
                      <p className="card-text">
                        {profile.user.last_name || "N/A"}
                      </p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-muted">Email</label>
                      <p className="card-text">{profile.user.email}</p>
                    </div>
                    {userRole === "doctor" && (
                      <div className="col-md-6 mb-3">
                        <label className="form-label text-muted">
                          Especialidad
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            className="form-control"
                            value={specialty}
                            onChange={(e) => setSpecialty(e.target.value)}
                          />
                        ) : (
                          <p className="card-text">
                            {profile.especialidad || "N/A"}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-top">
                    <h5 className="mb-3">Datos de Contacto</h5>
                    <div className="d-flex align-items-center justify-content-between flex-wrap">
                      <div className="flex-grow-1 me-3">
                        <label className="form-label text-muted">
                          Teléfono
                        </label>
                        {isEditing &&
                        (userRole === "paciente" || userRole === "doctor") ? (
                          <input
                            type="tel"
                            className="form-control"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                          />
                        ) : (
                          <p className="card-text">
                            {profile.telefono || "No especificado"}
                          </p>
                        )}
                      </div>
                      <div>
                        {userRole === "paciente" || userRole === "doctor" ? (
                          isEditing ? (
                            <div className="d-flex gap-2">
                              <button
                                onClick={handleSaveProfile}
                                disabled={isSaving}
                                className="btn btn-success"
                              >
                                {isSaving ? "Guardando..." : "Guardar"}
                              </button>
                              <button
                                onClick={() => {
                                  setIsEditing(false);
                                  setPhoneNumber(profile.telefono || "");
                                  if (userRole === "doctor") {
                                    setSpecialty(profile.especialidad || "");
                                  }
                                  setMessage({ text: "", type: "" });
                                }}
                                className="btn btn-secondary"
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setIsEditing(true)}
                              className="btn btn-primary"
                            >
                              Editar
                            </button>
                          )
                        ) : (
                          <div
                            className="alert alert-info text-center"
                            role="alert"
                            style={{ whiteSpace: "nowrap" }}
                          >
                            Modificar desde el panel de administración
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* <-- NUEVA SECCIÓN PARA PROCEDIMIENTOS --> */}
                  {userRole === "doctor" && (
                    <div className="mt-4 pt-4 border-top">
                      <h5 className="mb-3">Procedimientos que realiza</h5>
                      <p className="text-muted">
                        Esta es la lista de los procedimientos que el
                        administrador te ha asignado. Si necesitas agregar o
                        eliminar alguno, por favor, notifícaselo al
                        administrador.
                      </p>
                      {procedimientos.length > 0 ? (
                        <ul className="list-group">
                          {procedimientos.map((proc, index) => (
                            <li
                              key={index}
                              className="list-group-item d-flex justify-content-between align-items-center"
                            >
                              {proc.nombre}
                              <span className="badge bg-primary rounded-pill">
                                Duración: {proc.duracion_min} min
                              </span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <div className="alert alert-warning" role="alert">
                          Actualmente no tienes procedimientos asignados.
                        </div>
                      )}
                    </div>
                  )}
                  {/* <-- FIN DE LA NUEVA SECCIÓN --> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
