// src/components/Navbar.js
import { useAuth0 } from "@auth0/auth0-react";

export default function Navbar() {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  return (
    <nav style={{ padding: "1rem", background: "#f5f5f5" }}>
      {isAuthenticated ? (
        <>
          <span style={{ marginRight: "1rem" }}>
            👋 Hola, {user?.name || "Usuario"}
          </span>
          <button
            onClick={() =>
              logout({
                logoutParams: { returnTo: window.location.origin },
              })
            }
            style={{
              padding: "0.5rem 1rem",
              background: "#e63946",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Cerrar sesión
          </button>
        </>
      ) : (
        <button
          onClick={() => loginWithRedirect()}
          style={{
            padding: "0.5rem 1rem",
            background: "#1d3557",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Iniciar sesión
        </button>
      )}
    </nav>
  );
}
