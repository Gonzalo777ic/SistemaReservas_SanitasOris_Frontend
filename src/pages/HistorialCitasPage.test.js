import { useAuth0 } from "@auth0/auth0-react";
import "@testing-library/jest-dom";
import { render, screen, waitFor } from "@testing-library/react";
import { api } from "../services/api";
import HistorialCitasPage from "./HistorialCitasPage";

// Mock de las dependencias externas
jest.mock("@auth0/auth0-react");
jest.mock("../services/api");

// Mock de los componentes hijos para simplificar el test
jest.mock("../components/Sidebar", () => () => (
  <div data-testid="sidebar-mock"></div>
));
jest.mock(
  "../components/paciente/historial/AppointmentList",
  () =>
    ({ appointments }) =>
      (
        <div data-testid="appointment-list-mock">
          <span>Citas en la lista: {appointments.length}</span>
        </div>
      )
);

describe("HistorialCitasPage", () => {
  const mockUser = { email: "paciente@test.com" };
  const mockGetAccessTokenSilently = jest.fn();
  let apiGetSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth0.mockReturnValue({
      user: mockUser,
      getAccessTokenSilently:
        mockGetAccessTokenSilently.mockResolvedValue("mock-token"),
    });

    apiGetSpy = jest.spyOn(api, "get");

    // Mockear console.error para evitar que los mensajes de error de la prueba se muestren
    jest.spyOn(console, "error").mockImplementation(() => {});

    // Congelar la fecha actual para tener un punto de referencia fijo
    const mockDate = new Date("2025-11-01T12:00:00Z");
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterEach(() => {
    console.error.mockRestore();
    jest.useRealTimers();
  });

  // --- Datos de prueba ---
  const mockAppointments = [
    // Cita pasada para el usuario mock
    {
      id: 1,
      paciente: { user: { email: "paciente@test.com" } },
      fecha_hora: "2025-10-23T10:00:00Z",
      procedimiento: { nombre: "Revisión General" },
    },
    // Cita futura para el usuario mock (no debería mostrarse)
    {
      id: 2,
      paciente: { user: { email: "paciente@test.com" } },
      fecha_hora: "2025-11-20T11:00:00Z",
      procedimiento: { nombre: "Limpieza Dental" },
    },
    // Cita pasada para otro usuario (no debería mostrarse)
    {
      id: 3,
      paciente: { user: { email: "otro@test.com" } },
      fecha_hora: "2025-10-25T14:00:00Z",
      procedimiento: { nombre: "Cirugía Menor" },
    },
    // Otra cita pasada para el usuario mock
    {
      id: 4,
      paciente: { user: { email: "paciente@test.com" } },
      fecha_hora: "2025-09-15T09:00:00Z",
      procedimiento: { nombre: "Consulta de seguimiento" },
    },
  ];

  // --- Caso de prueba 1: Carga exitosa y renderizado del historial ---
  it("should render and fetch patient history successfully, displaying only past appointments for the current user", async () => {
    apiGetSpy.mockResolvedValue({ data: mockAppointments });
    render(<HistorialCitasPage />);

    // Verificar el estado de carga inicial
    expect(screen.getByText("Cargando tu historial...")).toBeInTheDocument();

    // Esperar a que la API se resuelva
    await waitFor(() => {
      expect(apiGetSpy).toHaveBeenCalledWith("reservas/", expect.anything());
    });

    // Verificar que el estado de carga desaparece
    expect(
      screen.queryByText("Cargando tu historial...")
    ).not.toBeInTheDocument();

    // Verificar que se renderiza el componente hijo con las citas correctas
    const appointmentListMock = screen.getByTestId("appointment-list-mock");
    expect(appointmentListMock).toBeInTheDocument();

    // De los 4 mocks, solo 2 son para el usuario actual Y son del pasado
    expect(screen.getByText("Citas en la lista: 2")).toBeInTheDocument();

    // Verificar que los títulos principales se renderizan
    expect(screen.getByText("Historial de Citas")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Aquí puedes ver un registro de tus citas pasadas y las notas del doctor."
      )
    ).toBeInTheDocument();
  });

  // --- Caso de prueba 2: Manejo de errores de la API ---
  it("should display an error message if fetching appointments fails", async () => {
    apiGetSpy.mockRejectedValue(new Error("Network error"));
    render(<HistorialCitasPage />);

    // Esperar a que el mensaje de error aparezca
    await waitFor(() => {
      expect(
        screen.getByText(
          "Error al cargar el historial de citas. Por favor, intenta de nuevo."
        )
      ).toBeInTheDocument();
    });

    // Asegurarse de que no se muestra la lista de citas
    expect(
      screen.queryByTestId("appointment-list-mock")
    ).not.toBeInTheDocument();
  });

  // --- Caso de prueba 3: No hay citas pasadas para el usuario ---
  it("should display a message when there are no past appointments", async () => {
    const futureAppointments = mockAppointments.filter(
      (app) => new Date(app.fecha_hora) >= new Date()
    );
    apiGetSpy.mockResolvedValue({ data: futureAppointments });
    render(<HistorialCitasPage />);

    // Esperar a que el estado de carga desaparezca
    await waitFor(() => {
      expect(
        screen.queryByText("Cargando tu historial...")
      ).not.toBeInTheDocument();
    });

    // Verificar el mensaje de historial vacío
    expect(
      screen.getByText("No tienes citas pasadas en tu historial.")
    ).toBeInTheDocument();

    // Asegurarse de que la lista de citas no se renderiza
    expect(
      screen.queryByTestId("appointment-list-mock")
    ).not.toBeInTheDocument();
  });
});
