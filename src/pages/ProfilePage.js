// src/pages/ProfilePage.js

import { useAuth0 } from "@auth0/auth0-react";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ErrorMessage from "../components/common/ErrorMessage"; // Reusable component for errors
import LoadingSpinner from "../components/common/LoadingSpinner"; // Reusable component for loading
import ProfileInfoCard from "../components/profile/ProfileInfoCard"; // New component

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
  const [procedimientos, setProcedimientos] = useState([]);

  const fetchProfile = useCallback(async () => {
    if (!user || !userRole) return;

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
  }, [user, userRole, getAccessTokenSilently]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

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

  const handleCancelEdit = () => {
    setIsEditing(false);
    setPhoneNumber(profile?.telefono || "");
    if (userRole === "doctor") {
      setSpecialty(profile?.especialidad || "");
    }
    setMessage({ text: "", type: "" });
  };

  if (loading) {
    return <LoadingSpinner message="Cargando perfil..." />;
  }

  if (!profile) {
    return <ErrorMessage message={message.text} />;
  }

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar userRole={userRole} />
      <main className="flex-grow-1 p-3 overflow-auto">
        <div className="container py-5">
          <ProfileInfoCard
            user={user}
            profile={profile}
            userRole={userRole}
            isEditing={isEditing}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            specialty={specialty}
            setSpecialty={setSpecialty}
            handleSaveProfile={handleSaveProfile}
            handleCancelEdit={handleCancelEdit}
            isSaving={isSaving}
            setMessage={setMessage}
            message={message}
            procedimientos={procedimientos} // Pass procedures to the card
            setIsEditing={setIsEditing}
          />
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
