// src/components/PrivateRoute.js
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

export default function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading, loginWithRedirect, user } = useAuth0();

  useEffect(() => {
    console.log("🔐 [PrivateRoute] Estado actualizado:", {
      isAuthenticated,
      isLoading,
      user,
    });
  }, [isAuthenticated, isLoading, user]);

  if (isLoading) return <div>Cargando...</div>;

  if (!isAuthenticated) {
    loginWithRedirect();
    return null;
  }

  return children;
}
