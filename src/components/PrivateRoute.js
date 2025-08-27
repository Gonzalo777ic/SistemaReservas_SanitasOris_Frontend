// src/components/PrivateRoute.js
import { useAuth0 } from "@auth0/auth0-react";

export default function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  if (isLoading) return <div>Cargando...</div>;

  if (!isAuthenticated) {
    // si no está logueado, lo mando a login
    loginWithRedirect();
    return null;
  }

  return children;
}
