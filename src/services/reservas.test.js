// Importamos el mock de la API. Jest automáticamente mockeará el módulo
// para que no hagamos llamadas HTTP reales.
import { api } from "./api";
import { actualizarReserva, crearReserva, getReservas } from "./reservas";

// Mockeamos el módulo `api.js` para controlar las respuestas de las peticiones
jest.mock("./api");

describe("reservas.js", () => {
  const mockToken = "fake-token-123";

  // Limpiamos los mocks antes de cada test para que no se contaminen.
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Tests para getReservas ---
  describe("getReservas", () => {
    it("debe llamar a la API con la URL correcta y el token de autorización", async () => {
      // Configuramos el mock para que `api.get` resuelva con datos de prueba
      const mockReservas = [
        { id: 1, name: "Reserva A" },
        { id: 2, name: "Reserva B" },
      ];
      api.get.mockResolvedValue({ data: mockReservas });

      // Llamamos a la función que vamos a probar
      const result = await getReservas(mockToken);

      // Verificamos que api.get fue llamado con los parámetros correctos
      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith("reservas/", {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });
      // Verificamos que la función devolvió los datos esperados
      expect(result).toEqual(mockReservas);
    });

    it("debe lanzar un error si la llamada a la API falla", async () => {
      // Simulamos que la API rechaza la petición con un error
      const mockError = new Error("Network error");
      api.get.mockRejectedValue(mockError);

      // Verificamos que la función lanza el error
      await expect(getReservas(mockToken)).rejects.toThrow(mockError);
    });
  });

  // --- Tests para crearReserva ---
  describe("crearReserva", () => {
    it("debe llamar a la API con la URL correcta, los datos y el token", async () => {
      // Datos de prueba para la nueva reserva
      const mockReserva = {
        fecha: "2023-10-27",
        descripcion: "Reserva de prueba",
      };
      // Configuramos el mock para que `api.post` resuelva con los datos de la reserva creada
      api.post.mockResolvedValue({ data: { id: 3, ...mockReserva } });

      const result = await crearReserva(mockReserva, mockToken);

      // Verificamos que api.post fue llamado correctamente
      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post).toHaveBeenCalledWith("reservas/", mockReserva, {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });
      // Verificamos que la función devuelve la nueva reserva
      expect(result).toEqual({ id: 3, ...mockReserva });
    });

    it("debe lanzar un error si la llamada a la API falla", async () => {
      const mockError = new Error("Validation failed");
      api.post.mockRejectedValue(mockError);

      await expect(crearReserva({}, mockToken)).rejects.toThrow(mockError);
    });
  });

  // --- Tests para actualizarReserva ---
  describe("actualizarReserva", () => {
    it("debe llamar a la API con el ID, los datos y el token", async () => {
      const reservaId = 5;
      const mockReservaActualizada = {
        fecha: "2023-11-27",
        descripcion: "Descripción actualizada",
      };
      // Configuramos el mock para que `api.put` resuelva con los datos de la reserva actualizada
      api.put.mockResolvedValue({ data: mockReservaActualizada });

      const result = await actualizarReserva(
        reservaId,
        mockReservaActualizada,
        mockToken
      );

      // Verificamos que api.put fue llamado con los parámetros correctos
      expect(api.put).toHaveBeenCalledTimes(1);
      expect(api.put).toHaveBeenCalledWith(
        `reservas/${reservaId}/`,
        mockReservaActualizada,
        {
          headers: {
            Authorization: `Bearer ${mockToken}`,
          },
        }
      );
      // Verificamos que la función devuelve la reserva actualizada
      expect(result).toEqual(mockReservaActualizada);
    });

    it("debe lanzar un error si la llamada a la API falla", async () => {
      const mockError = new Error("Not Found");
      api.put.mockRejectedValue(mockError);

      await expect(actualizarReserva(1, {}, mockToken)).rejects.toThrow(
        mockError
      );
    });
  });
});
