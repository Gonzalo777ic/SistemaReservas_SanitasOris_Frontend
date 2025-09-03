import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function RedirectByRole() {
  const { getAccessTokenSilently } = useAuth0();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const token = await getAccessTokenSilently({
        authorizationParams: {
          audience: process.env.REACT_APP_AUTH0_AUDIENCE,
        },
      });

      const res = await fetch("http://localhost:8000/api/whoami/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      console.log("🌐 RedirectByRole:", data);

      if (data.role === "doctor") navigate("/dashboard-doctor");
      else if (data.role === "admin") navigate("/dashboard-admin");
      else navigate("/dashboard-paciente");

      setLoading(false);
    };

    checkRole();
  }, [getAccessTokenSilently, navigate]);

  if (loading) return <div>Cargando...</div>;
  return null;
}
