// src/components/Navbar.js
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const {
    loginWithRedirect,
    logout,
    isAuthenticated,
    user,
    getAccessTokenSilently,
  } = useAuth0();

  // 🔹 Estado para controlar la sincronización única
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    // 🟢 Solución: Sincronizar solo si el objeto 'user' existe
    if (user && !isSynced) {
      const syncUser = async () => {
        try {
          // Nota: getAccessTokenSilently puede fallar si el token no está listo
          // La mejor práctica es capturar ese error y esperar.
          const token = await getAccessTokenSilently({
            authorizationParams: {
              audience: "http://127.0.0.1:8000/", // Asegúrate de que este 'audience' coincida con tu backend
            },
          });
          console.log("Access Token:", token);

          const res = await fetch("http://127.0.0.1:8000/api/sync-user/", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
            }),
          });

          const data = await res.json();
          console.log("SyncUser Response:", data);
          setIsSynced(true);
        } catch (err) {
          console.error("❌ Error sincronizando usuario:", err);
          // Opcional: Reiniciar `isSynced` para reintentar en el próximo cambio de estado
          // setIsSynced(false);
        }
      };

      syncUser();
    }
  }, [user, getAccessTokenSilently, isSynced]);

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
