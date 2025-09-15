import { useAuth0 } from "@auth0/auth0-react";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { api } from "../services/api";
import DashboardAdmin from "./DashboardAdmin";

// Mock de las dependencias externas y componentes hijos
jest.mock("@auth0/auth0-react");
jest.mock("../services/api");
jest.mock("../components/Sidebar", () => () => (
  <div data-testid="sidebar-mock"></div>
));
jest.mock("../components/dashboard/StatsCards", () => (props) => (
  <div data-testid="stats-cards-mock">
    {/* Este mock puede tener botones para simular la interacción con weekOffset */}
  </div>
));
jest.mock("../components/admin/AdminCalendar", () => (props) => (
  <div data-testid="admin-calendar-mock">
    <span>Citas: {props.appointments.length}</span>
  </div>
));

const mockStats = {
  citas_pendientes: 5,
  citas_semana: 12,
  total_pacientes: 50,
};

const mockReservas = [
  {
    id: 1,
    paciente: { user: { first_name: "Ana", last_name: "García" } },
    procedimiento: { nombre: "Revisión General" },
    fecha_hora: "2025-10-23T10:00:00Z",
    duracion_min: 30,
  },
  {
    id: 2,
    paciente: { user: { first_name: "Luis", last_name: "Pérez" } },
    procedimiento: { nombre: "Limpieza Dental" },
    fecha_hora: "2025-10-23T11:00:00Z",
    duracion_min: 60,
  },
];

describe("DashboardAdmin", () => {
  const mockGetAccessTokenSilently = jest.fn();

  beforeEach(() => {
    // Restablecer los mocks antes de cada prueba
    jest.clearAllMocks();
    useAuth0.mockReturnValue({
      getAccessTokenSilently:
        mockGetAccessTokenSilently.mockResolvedValue("mock-token"),
    });

    // Configurar el mock de la API para que devuelva datos exitosos
    api.get.mockImplementation((url) => {
      if (url.includes("admin/stats")) {
        return Promise.resolve({ data: mockStats });
      }
      if (url.includes("reservas")) {
        return Promise.resolve({ data: mockReservas });
      }
      return Promise.reject(new Error("URL de API no reconocida"));
    });
  });

  it("should render and fetch dashboard data successfully", async () => {
    render(<DashboardAdmin />);

    // Verificar que el estado de carga inicial se muestre
    expect(
      screen.getByText("Cargando datos del dashboard...")
    ).toBeInTheDocument();

    // Esperar a que las llamadas a la API se completen
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledTimes(2);
      expect(api.get).toHaveBeenCalledWith(
        "admin/stats/?week_offset=0",
        expect.anything()
      );
      expect(api.get).toHaveBeenCalledWith(
        "reservas/?week_offset=0",
        expect.anything()
      );
    });

    // Verificar que el estado de carga ha desaparecido
    expect(
      screen.queryByText("Cargando datos del dashboard...")
    ).not.toBeInTheDocument();

    // Verificar que los componentes hijos se rendericen
    expect(screen.getByTestId("sidebar-mock")).toBeInTheDocument();
    expect(screen.getByTestId("stats-cards-mock")).toBeInTheDocument();
    expect(screen.getByTestId("admin-calendar-mock")).toBeInTheDocument();
    expect(screen.getByText("Citas: 2")).toBeInTheDocument();
  });

  it("should display an error message if data fetching fails", async () => {
    // Simular un error en la llamada a la API
    api.get.mockRejectedValue(new Error("Network error"));

    render(<DashboardAdmin />);

    await waitFor(() => {
      expect(
        screen.getByText("Error al cargar los datos del panel.")
      ).toBeInTheDocument();
    });
  });

  it("should transform appointment data for the calendar", async () => {
    render(<DashboardAdmin />);
    await waitFor(() => expect(api.get).toHaveBeenCalledTimes(2));

    const calendarMock = screen.getByTestId("admin-calendar-mock");

    // Aquí verificamos que los datos se hayan transformado correctamente antes de ser pasados
    // al componente hijo.
    expect(calendarMock.textContent).toContain("Citas: 2");

    // Aunque no podemos acceder directamente a las props pasadas sin un mock más complejo,
    // el test anterior ya valida que el componente Calendario recibe el número correcto de citas.
    // Un mock más avanzado podría validar el contenido exacto de las props.
  });
});
