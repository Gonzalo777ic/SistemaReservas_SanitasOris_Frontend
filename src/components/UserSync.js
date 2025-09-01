// src/components/UserSync.js
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";

export default function UserSync() {
  const { user, getAccessTokenSilently } = useAuth0();
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const syncUser = async () => {
      if (!user?.email || !user?.sub) {
        console.warn("No se puede sincronizar: falta email o sub", user);
        return;
      }

      try {
        const token = await getAccessTokenSilently({
          authorizationParams: {
            audience: process.env.REACT_APP_AUTH0_AUDIENCE,
          },
        });

        console.log("AUTH0 USER", user);

        const response = await fetch("http://localhost:8000/api/sync-user/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: user.email,
            name: user.name || "Paciente",
            sub: user.sub,
          }),
        });

        if (!response.ok) {
          console.error("Error del backend:", await response.json());
        } else {
          console.log("Usuario sincronizado correctamente");
          setSynced(true);
        }
      } catch (error) {
        console.error("❌ Error sincronizando usuario:", error);
      }
    };

    if (user && !synced) {
      syncUser();
    }
  }, [user, getAccessTokenSilently, synced]);

  return null;
}
