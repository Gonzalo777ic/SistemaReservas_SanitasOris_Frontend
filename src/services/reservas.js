// filepath: frontend/src/services/reservas.js
import { api } from "./api";

export const getReservas = async (token) => {
  try {
    const response = await api.get("reservas/", {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ ahora sí usas el token recibido
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    throw error;
  }
};

export async function crearReserva(reserva, token) {
  try {
    console.log("Datos enviados al backend:", reserva); // 🔍 <-- aquí

    const response = await api.post("reservas/", reserva, {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ corregido: antes tenías "Token"
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function actualizarReserva(id, reserva, token) {
  try {
    const response = await api.put(`reservas/${id}/`, reserva, {
      headers: {
        Authorization: `Bearer ${token}`, // ✅ agregado para consistencia
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}
