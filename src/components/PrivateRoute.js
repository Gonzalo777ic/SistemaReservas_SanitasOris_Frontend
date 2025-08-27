// src/components/PrivateRoute.js
import { useAuth0 } from "@auth0/auth0-react";

export default function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();

  if (isLoading) {
    return <p>Cargando...</p>;
  }

  if (!isAuthenticated) {
    // opción 1: redirigir automáticamente al login de Auth0
    loginWithRedirect();
    return null;

    // opción 2: mostrar mensaje/botón
    // return <Navigate to="/login" />;
  }

  return children;
}
