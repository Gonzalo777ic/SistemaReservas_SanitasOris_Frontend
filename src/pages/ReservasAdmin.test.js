import { useAuth0 } from "@auth0/auth0-react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReservasAdmin from "./ReservasAdmin";

// Mock de las dependencias
jest.mock("@auth0/auth0-react");
jest.spyOn(console, "error").mockImplementation(() => {});

// Mock de los componentes hijos para aislarlos
jest.mock("../components/Sidebar", () => () => <div data-testid="sidebar" />);
jest.mock(
  "../components/admin/reservas/ReservasFilters",
  () =>
    ({ filter, setFilter }) =>
      (
        <div data-testid="reservas-filters">
          <button
            onClick={() => setFilter("pendiente")}
            data-testid="filter-pendiente"
          >
            Pendiente
          </button>
          <button
            onClick={() => setFilter("aprobada")}
            data-testid="filter-aprobada"
          >
            Aprobada
          </button>
        </div>
      )
);
jest.mock(
  "../components/admin/reservas/ReservasTable",
  () =>
    ({ reservas, onUpdateStatus }) =>
      (
        <div data-testid="reservas-table">
          {reservas.map((reserva) => (
            <div key={reserva.id}>
              <span>
                {reserva.paciente_nombre} - {reserva.estado}
              </span>
              <button
                onClick={() => onUpdateStatus(reserva.id, "aprobada")}
                data-testid={`update-btn-${reserva.id}`}
              >
                Aprobar
              </button>
            </div>
          ))}
        </div>
      )
);

describe("ReservasAdmin", () => {
  const mockReservasPendientes = [
    { id: 1, paciente_nombre: "Juan Pérez", estado: "pendiente" },
  ];
  const mockReservasAprobadas = [
    { id: 2, paciente_nombre: "Ana Gómez", estado: "aprobada" },
  ];
  const mockToken = "mock-token";

  beforeEach(() => {
    useAuth0.mockReturnValue({
      getAccessTokenSilently: jest.fn().mockResolvedValue(mockToken),
    });
    // Mock global fetch para simular las llamadas a la API
    global.fetch = jest.fn((url) => {
      if (url.includes("estado=pendiente")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockReservasPendientes),
        });
      }
      if (url.includes("estado=aprobada")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockReservasAprobadas),
        });
      }
      return Promise.reject(new Error("URL no reconocida"));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test Case 1: Muestra el estado de carga inicial
  it("debe mostrar un estado de carga inicialmente", async () => {
    // Retrasar la respuesta del mock para que el estado de carga sea visible
    global.fetch.mockImplementationOnce(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve({ ok: true, json: () => Promise.resolve([]) }),
            100
          )
        )
    );
    render(<ReservasAdmin />);
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  // Test Case 2: Muestra la tabla de reservas después de una carga exitosa
  it("debe mostrar la tabla de reservas después de una carga exitosa", async () => {
    render(<ReservasAdmin />);
    await waitFor(() => {
      expect(screen.queryByText("Cargando...")).not.toBeInTheDocument();
      expect(screen.getByTestId("reservas-table")).toBeInTheDocument();
      expect(screen.getByText("Juan Pérez - pendiente")).toBeInTheDocument();
    });
  });

  // Test Case 3: Muestra un error si la carga de datos falla
  it("debe mostrar un mensaje de error si la carga de datos falla", async () => {
    global.fetch.mockImplementationOnce(() =>
      Promise.resolve({ ok: false, status: 404, statusText: "Not Found" })
    );
    render(<ReservasAdmin />);
    await waitFor(() => {
      expect(
        screen.getByText("No se pudo cargar la lista de reservas.")
      ).toBeInTheDocument();
    });
  });

  // Test Case 4: Actualiza la lista de reservas cuando se cambia el filtro
  it("debe actualizar la lista de reservas cuando se cambia el filtro", async () => {
    render(<ReservasAdmin />);
    await waitFor(() => {
      expect(screen.getByText("Juan Pérez - pendiente")).toBeInTheDocument();
    });
    const filterBtn = screen.getByTestId("filter-aprobada");
    await userEvent.click(filterBtn);
    await waitFor(() => {
      expect(screen.getByText("Ana Gómez - aprobada")).toBeInTheDocument();
      expect(
        screen.queryByText("Juan Pérez - pendiente")
      ).not.toBeInTheDocument();
    });
  });
});
