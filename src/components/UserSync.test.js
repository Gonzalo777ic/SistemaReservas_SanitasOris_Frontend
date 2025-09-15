import { useAuth0 } from "@auth0/auth0-react";
import "@testing-library/jest-dom";
import { render, waitFor } from "@testing-library/react";
import UserSync from "./UserSync";

// Mock de las dependencias externas
jest.mock("@auth0/auth0-react");

const mockUser = {
  email: "test@example.com",
  sub: "auth0|12345",
  name: "Test User",
};

describe("UserSync", () => {
  const mockGetAccessTokenSilently = jest.fn();
  const mockFetch = jest.fn();
  let consoleLogSpy, consoleWarnSpy, consoleErrorSpy;

  beforeEach(() => {
    // Restablecer los mocks y espías antes de cada prueba
    jest.clearAllMocks();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    global.fetch = mockFetch;

    // Espiar los métodos de la consola para verificar las llamadas
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restaurar los espías después de cada prueba
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  // --- Caso 1: Sincronización exitosa del usuario ---
  it("should sync the user data to the backend on initial render", async () => {
    useAuth0.mockReturnValue({
      user: mockUser,
      getAccessTokenSilently:
        mockGetAccessTokenSilently.mockResolvedValue("mock-token"),
    });

    render(<UserSync />);

    // Esperar a que la llamada asíncrona ocurra
    await waitFor(() => {
      expect(mockGetAccessTokenSilently).toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/sync-user/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer mock-token`,
          },
          body: JSON.stringify({
            email: "test@example.com",
            name: "Test User",
            sub: "auth0|12345",
          }),
        }
      );
      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Usuario sincronizado correctamente"
      );
    });
  });

  // --- Caso 2: No se sincroniza si los datos del usuario están incompletos ---
  it("should not sync if user email or sub is missing", async () => {
    useAuth0.mockReturnValue({
      user: { sub: "auth0|12345" }, // user.email is missing
      getAccessTokenSilently: mockGetAccessTokenSilently,
    });

    render(<UserSync />);

    // Esperar un momento para asegurar que no se realizó ninguna llamada
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockGetAccessTokenSilently).not.toHaveBeenCalled();
    expect(mockFetch).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      "No se puede sincronizar: falta email o sub",
      { sub: "auth0|12345" }
    );
  });

  // --- Caso 3: Manejo de errores de la API ---
  it("should handle API errors gracefully", async () => {
    useAuth0.mockReturnValue({
      user: mockUser,
      getAccessTokenSilently:
        mockGetAccessTokenSilently.mockResolvedValue("mock-token"),
    });

    // Simular un error del servidor
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "Server error" }),
    });

    render(<UserSync />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error del backend:", {
        error: "Server error",
      });
    });
  });

  // --- Caso 4: Sincronización solo una vez por sesión ---
  it("should not sync again on subsequent renders", async () => {
    useAuth0.mockReturnValue({
      user: mockUser,
      getAccessTokenSilently:
        mockGetAccessTokenSilently.mockResolvedValue("mock-token"),
    });

    const { rerender } = render(<UserSync />);

    // Primera renderización y sincronización
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    // Simular una nueva renderización del componente
    rerender(<UserSync />);

    // La llamada a la API no debe ocurrir de nuevo
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });
});
