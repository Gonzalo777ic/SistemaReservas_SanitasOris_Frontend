import { useAuth0 } from "@auth0/auth0-react";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { api } from "../services/api";
import CitasDoctorPage from "./CitasDoctorPage";

// Mock de las dependencias y componentes hijos
jest.mock("@auth0/auth0-react");
jest.mock("../services/api");
jest.mock("../components/Sidebar", () => () => (
  <div data-testid="sidebar-mock"></div>
));
jest.mock("../components/citas/CitasTable", () => (props) => {
  const { reservas, loading, error } = props;
  return (
    <div data-testid="citas-table-mock">
      {loading && <span>Cargando Citas...</span>}
      {error && <span>{error}</span>}
      {!loading && !error && (
        <span data-testid="table-data">{reservas.length} reservas</span>
      )}
    </div>
  );
});
jest.mock("../components/citas/CitasModals", () => (props) => (
  <div data-testid="citas-modals-mock" {...props}></div>
));

const mockReservas = [
  {
    id: 1,
    paciente: { user: { first_name: "Ana" } },
    fecha_hora: "2023-11-20T10:00:00Z",
    estado: "pendiente",
  },
  {
    id: 2,
    paciente: { user: { first_name: "Luis" } },
    fecha_hora: "2023-11-21T11:00:00Z",
    estado: "confirmada",
  },
];

describe("CitasDoctorPage", () => {
  const mockGetAccessTokenSilently = jest.fn();

  beforeEach(() => {
    // Restablecer los mocks antes de cada prueba
    jest.clearAllMocks();
    useAuth0.mockReturnValue({
      getAccessTokenSilently:
        mockGetAccessTokenSilently.mockResolvedValue("mock-token"),
    });
    // Simular una respuesta exitosa por defecto
    api.get.mockResolvedValue({ data: mockReservas });
  });

  // --- Caso 1: Sincronización exitosa del usuario ---
  it("should render and fetch reservations successfully", async () => {
    render(<CitasDoctorPage />);

    // Verificar que el estado de carga inicial se muestre
    expect(screen.getByText("Cargando Citas...")).toBeInTheDocument();

    // Esperar a que la llamada a la API y el estado de carga terminen
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith("reservas/", {
        headers: { Authorization: "Bearer mock-token" },
      });
      expect(screen.queryByText("Cargando Citas...")).not.toBeInTheDocument();
      expect(screen.getByText("2 reservas")).toBeInTheDocument();
    });

    // Verificar que los componentes hijos sean renderizados
    expect(screen.getByTestId("sidebar-mock")).toBeInTheDocument();
    expect(screen.getByTestId("citas-modals-mock")).toBeInTheDocument();
  });

  // --- Caso 2: Manejo de errores de la API ---
  it("should display an error message if fetching reservations fails", async () => {
    // Simular un error en la llamada a la API
    api.get.mockRejectedValue(new Error("Network error"));
    render(<CitasDoctorPage />);

    // Esperar a que el error se propague y se muestre el mensaje
    await waitFor(() => {
      expect(
        screen.getByText("Error al cargar la lista de citas.")
      ).toBeInTheDocument();
      expect(screen.queryByText("Cargando Citas...")).not.toBeInTheDocument();
    });
  });
});
