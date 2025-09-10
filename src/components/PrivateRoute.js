// src/components/PrivateRoute.js
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

export default function PrivateRoute({ allowedRoles }) {
  const {
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    getAccessTokenSilently,
  } = useAuth0();
  const [role, setRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      if (!isAuthenticated) return;
      setLoadingRole(true); // <--- Aseguramos que el estado de carga esté en true
      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: process.env.REACT_APP_AUTH0_AUDIENCE,
          },
        });

        const res = await fetch("http://localhost:8000/api/whoami/", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        console.log("👤 whoami FRONT:", data);
        setRole(data.role);
      } catch (err) {
        console.error("❌ Error obteniendo rol:", err);
      } finally {
        setLoadingRole(false);
      }
    };

    fetchRole();
  }, [isAuthenticated, getAccessTokenSilently]);

  if (isLoading) return <div>Cargando...</div>;

  if (!isAuthenticated) {
    loginWithRedirect();
    return null;
  }

  // Ahora, siempre pasamos el estado de carga junto con el rol
  return <Outlet context={{ role, loadingRole }} />;
}
