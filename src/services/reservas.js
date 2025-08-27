// filepath: /home/c-sar-gonzalo-isique-castro/Projects/SistemaReservas_SanitasOris/frontend/src/services/reservas.js
import api from "./api";

export const getReservas = async () => {
  try {
    const response = await api.get("reservas/");
    return response.data;
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    throw error;
  }
};

export async function crearReserva(reserva, token) {
  try {
    const response = await api.post("reservas/", reserva, {
      headers: {
        Authorization: `Token ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function actualizarReserva(id, reserva) {
  try {
    const response = await api.put(`reservas/${id}/`, reserva);
    return response.data;
  } catch (error) {
    throw error;
  }
}
