import { useAuth0 } from "@auth0/auth0-react";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import RedirectByRole from "./RedirectByRole";

// Mock de las dependencias externas
jest.mock("@auth0/auth0-react");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

// Mock para simular las respuestas de la API
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("RedirectByRole", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    // Limpiar todos los mocks antes de cada prueba
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
    useAuth0.mockReturnValue({
      getAccessTokenSilently: jest.fn().mockResolvedValue("mock-token"),
    });
  });

  // --- Caso 1: Muestra "Cargando..." mientras se obtiene el rol ---
  it("should show loading message while fetching user role", () => {
    // Simula una respuesta de la API que tarda un poco
    mockFetch.mockResolvedValueOnce({
      json: () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ role: "paciente" }), 50)
        ),
    });

    render(<RedirectByRole />);

    // Verifica que el estado de carga esté activo
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  // --- Caso 2: Redirige al dashboard del doctor ---
  it("should redirect to doctor dashboard if user has 'doctor' role", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ role: "doctor" }),
    });

    render(<RedirectByRole />);

    // Esperar a que la redirección ocurra
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard-doctor");
    });
    expect(screen.queryByText("Cargando...")).not.toBeInTheDocument();
  });

  // --- Caso 3: Redirige al dashboard del administrador ---
  it("should redirect to admin dashboard if user has 'admin' role", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ role: "admin" }),
    });

    render(<RedirectByRole />);

    // Esperar a que la redirección ocurra
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard-admin");
    });
    expect(screen.queryByText("Cargando...")).not.toBeInTheDocument();
  });

  // --- Caso 4: Redirige al dashboard del paciente ---
  it("should redirect to paciente dashboard if user has 'paciente' role", async () => {
    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ role: "paciente" }),
    });

    render(<RedirectByRole />);

    // Esperar a que la redirección ocurra
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard-paciente");
    });
    expect(screen.queryByText("Cargando...")).not.toBeInTheDocument();
  });
});
