// src/components/PrivateRoute.js
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom"; // Import useNavigate

export default function PrivateRoute({ allowedRoles }) {
  const {
    isAuthenticated,
    isLoading,
    loginWithRedirect,
    getAccessTokenSilently,
  } = useAuth0();
  const [role, setRole] = useState(null);
  const [loadingRole, setLoadingRole] = useState(true);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const fetchRole = async () => {
      if (!isAuthenticated) return;
      setLoadingRole(true);
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
        setRole(data.role);
      } catch (err) {
        console.error("❌ Error obteniendo rol:", err);
        // Optionally, navigate to an error page or logout if role fetching fails
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

  // --- NEW RBAC LOGIC ---
  if (allowedRoles && !allowedRoles.includes(role)) {
    console.warn(
      `Access Denied: User role "${role}" not in allowed roles [${allowedRoles.join(
        ", "
      )}]. Redirecting...`
    );
    // Redirect to a dashboard or a "not authorized" page
    // You could make this more intelligent, e.g., redirect to their own dashboard
    switch (role) {
      case "admin":
        navigate("/dashboard-admin");
        break;
      case "doctor":
        navigate("/dashboard-doctor");
        break;
      case "paciente":
        navigate("/dashboard-paciente");
        break;
      default:
        navigate("/"); // Fallback to root or a generic unauthorized page
    }
    return null; // Don't render anything while redirecting
  }
  // --- END NEW RBAC LOGIC ---

  return <Outlet context={{ role, loadingRole }} />;
}
