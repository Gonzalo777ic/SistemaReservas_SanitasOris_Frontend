// src/components/PrivateRoute.js
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

export default function PrivateRoute({ children, allowedRoles }) {
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

      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: process.env.REACT_APP_AUTH0_AUDIENCE,
          },
        });

        const res = await fetch("http://localhost:8000/api/whoami/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        console.log("👤 whoami FRONT:", data); // 👈 log para ver qué llega
        setRole(data.role);
      } catch (err) {
        console.error("❌ Error obteniendo rol:", err);
      } finally {
        setLoadingRole(false);
      }
    };

    fetchRole();
  }, [isAuthenticated, getAccessTokenSilently]);

  if (isLoading || loadingRole) return <div>Cargando...</div>;

  if (!isAuthenticated) {
    loginWithRedirect();
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <div>No autorizado</div>;
  }

  return children;
}
