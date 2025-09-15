import { useAuth0 } from "@auth0/auth0-react";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import DashboardDoctor from "./DashboardDoctor";

// Mock de las dependencias externas y componentes hijos
jest.mock("@auth0/auth0-react");
jest.mock("../components/Sidebar", () => () => (
  <div data-testid="sidebar-mock"></div>
));
jest.mock("../components/dashboard/StatsCards", () => (props) => (
  <div data-testid="stats-cards-mock">
    {/* Este mock puede tener botones para simular la interacción con weekOffset */}
  </div>
));
jest.mock("../components/doctor/DoctorCalendar", () => (props) => (
  <div data-testid="doctor-calendar-mock">
    <span>Citas: {props.appointments.length}</span>
  </div>
));

const mockStats = {
  citas_confirmadas: 8,
  citas_pendientes: 4,
  pacientes_semana: 15,
};

const mockReservas = [
  {
    id: 1,
    paciente: "Ana García",
    procedimiento: "Revisión General",
    fecha_hora: "2025-10-23T10:00:00Z",
    duracion_min: 30,
  },
  {
    id: 2,
    paciente: "Luis Pérez",
    procedimiento: "Limpieza Dental",
    fecha_hora: "2025-10-23T11:00:00Z",
    duracion_min: 60,
  },
];

describe("DashboardDoctor", () => {
  const mockGetAccessTokenSilently = jest.fn();
  const mockUser = { name: "Dr. Mock", email: "dr.mock@test.com" };

  beforeEach(() => {
    // Restablecer los mocks antes de cada prueba
    jest.clearAllMocks();
    useAuth0.mockReturnValue({
      getAccessTokenSilently:
        mockGetAccessTokenSilently.mockResolvedValue("mock-token"),
      user: mockUser,
    });
    // Simular una respuesta exitosa por defecto para fetch
    jest.spyOn(global, "fetch").mockImplementation((url) => {
      if (url.includes("doctor/stats")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockStats),
        });
      }
      if (url.includes("doctor/reservas")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockReservas),
        });
      }
      return Promise.reject(new Error("URL de API no reconocida"));
    });
  });

  afterEach(() => {
    global.fetch.mockRestore();
  });

  it("should render and fetch dashboard data successfully", async () => {
    render(<DashboardDoctor />);

    // Verificar que el estado de carga inicial se muestre
    expect(screen.getByText("Cargando datos del panel...")).toBeInTheDocument();

    // Esperar a que las llamadas a la API se completen
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/doctor/stats/?week_offset=0",
        expect.anything()
      );
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:8000/api/doctor/reservas/?week_offset=0",
        expect.anything()
      );
    });

    // Verificar que el estado de carga ha desaparecido
    expect(
      screen.queryByText("Cargando datos del panel...")
    ).not.toBeInTheDocument();

    // Verificar que los componentes hijos se rendericen
    expect(screen.getByTestId("sidebar-mock")).toBeInTheDocument();
    expect(screen.getByTestId("stats-cards-mock")).toBeInTheDocument();
    expect(screen.getByTestId("doctor-calendar-mock")).toBeInTheDocument();
    expect(screen.getByText("Citas: 2")).toBeInTheDocument();
    expect(screen.getByText("Bienvenido, Dr. Mock 👋")).toBeInTheDocument();
  });

  it("should display an error message if data fetching fails", async () => {
    // Simular un error en la llamada a la API
    jest
      .spyOn(global, "fetch")
      .mockImplementationOnce(() => Promise.resolve({ ok: false }));

    render(<DashboardDoctor />);

    await waitFor(() => {
      expect(
        screen.getByText("Error al cargar los datos del panel.")
      ).toBeInTheDocument();
    });
  });

  it("should transform appointment data for the calendar", async () => {
    render(<DashboardDoctor />);
    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));

    const calendarMock = screen.getByTestId("doctor-calendar-mock");
    expect(calendarMock.textContent).toContain("Citas: 2");
  });
});
