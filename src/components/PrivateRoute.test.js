import { useAuth0 } from "@auth0/auth0-react";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";

// Mock de las dependencias externas
jest.mock("@auth0/auth0-react");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  Outlet: () => <div data-testid="outlet">Mock Outlet</div>,
  useNavigate: jest.fn(),
}));

// Mock para simular las respuestas de la API
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("PrivateRoute", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    // Limpiar los mocks antes de cada prueba
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockNavigate);
  });

  // --- Caso 1: Muestra "Cargando..." mientras se autentica ---
  it("should show loading message when isLoading is true", () => {
    useAuth0.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
      loginWithRedirect: jest.fn(),
      getAccessTokenSilently: jest.fn(),
    });

    render(<PrivateRoute />);

    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  // --- Caso 2: Muestra "Cargando..." mientras se obtiene el rol ---
  it("should show loading message while fetching user role", async () => {
    useAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      getAccessTokenSilently: jest.fn().mockResolvedValue("mock-token"),
    });

    // Simula una respuesta de la API que tarda un poco
    mockFetch.mockResolvedValueOnce({
      json: () =>
        new Promise((resolve) =>
          setTimeout(() => resolve({ role: "paciente" }), 50)
        ),
    });

    render(<PrivateRoute />);

    // Verifica que el estado de carga esté activo
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  // --- Caso 3: Redirección por rol no autorizado ---
  it("should redirect an unauthorized user based on their role", async () => {
    useAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      getAccessTokenSilently: jest.fn().mockResolvedValue("mock-token"),
    });

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ role: "doctor" }), // Usuario es doctor
    });

    // El componente se renderiza con roles permitidos para un paciente
    render(<PrivateRoute allowedRoles={["paciente"]} />);

    // Esperar a que la redirección ocurra
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard-doctor");
    });
  });

  // --- Caso 4: Acceso permitido ---
  it("should render the Outlet component for an authorized user", async () => {
    useAuth0.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
      getAccessTokenSilently: jest.fn().mockResolvedValue("mock-token"),
    });

    mockFetch.mockResolvedValueOnce({
      json: () => Promise.resolve({ role: "admin" }), // Usuario es admin
    });

    // El componente se renderiza con roles permitidos para un admin
    render(<PrivateRoute allowedRoles={["admin"]} />);

    // Espera hasta que el Outlet se renderice
    await waitFor(() => {
      expect(screen.getByTestId("outlet")).toBeInTheDocument();
    });
  });
});
