// src/components/Navbar.js
import { useAuth0 } from "@auth0/auth0-react";

export default function Navbar() {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  return (
    <nav style={{ padding: "1rem", background: "#eee" }}>
      {isAuthenticated ? (
        <>
          <span>Hola, {user?.name}</span>
          <button
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
          >
            Cerrar sesión
          </button>
        </>
      ) : (
        <button onClick={() => loginWithRedirect()}>Iniciar sesión</button>
      )}
    </nav>
  );
}
