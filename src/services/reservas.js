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
