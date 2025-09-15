import { useAuth0 } from "@auth0/auth0-react";
import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useLocation, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import DashboardPaciente from "./DashboardPaciente";

// Mock de las dependencias externas y componentes hijos
jest.mock("@auth0/auth0-react");
jest.mock("react-router-dom");
jest.mock("../services/api");
jest.mock("../components/Sidebar", () => () => (
  <div data-testid="sidebar-mock"></div>
));
jest.mock("../components/paciente/AppointmentCalendar", () => (props) => (
  <div data-testid="appointment-calendar-mock">
    <span>Citas: {props.appointments.length}</span>
    {props.appointments.map((app) => (
      <button key={app.id} onClick={() => props.handleShowCancelModal(app)}>
        Cancelar
      </button>
    ))}
  </div>
));
jest.mock("../components/paciente/CancelAppointmentModal", () => (props) => {
  if (!props.show) return null;
  return (
    <div data-testid="cancel-modal-mock">
      <span>¿Estás seguro de que deseas cancelar la cita?</span>
      <button onClick={props.handleCancelAppointment}>Confirmar</button>
      <button onClick={props.onHide}>Cerrar</button>
    </div>
  );
});

const mockAppointments = [
  {
    id: 1,
    procedimiento: { nombre: "Revisión General" },
    fecha_hora: "2025-10-23T10:00:00Z",
    duracion_min: 30,
    estado: "pendiente",
  },
  {
    id: 2,
    procedimiento: { nombre: "Limpieza Dental" },
    fecha_hora: "2025-10-24T11:00:00Z",
    duracion_min: 60,
    estado: "confirmada",
  },
];

describe("DashboardPaciente", () => {
  const mockGetAccessTokenSilently = jest.fn();
  const mockUser = { name: "Paciente Mock", email: "paciente@test.com" };
  const mockNavigate = jest.fn();
  let apiGetSpy;
  let apiPatchSpy;

  beforeEach(() => {
    jest.clearAllMocks();

    // Configura el valor por defecto para useLocation antes de cada test
    useLocation.mockReturnValue({ pathname: "/", state: {} });
    useNavigate.mockReturnValue(mockNavigate);
    useAuth0.mockReturnValue({
      getAccessTokenSilently:
        mockGetAccessTokenSilently.mockResolvedValue("mock-token"),
      user: mockUser,
    });

    apiGetSpy = jest
      .spyOn(api, "get")
      .mockResolvedValue({ data: mockAppointments });
    apiPatchSpy = jest.spyOn(api, "patch").mockResolvedValue({});

    // Mockear console.error para evitar que los mensajes de error de la prueba se muestren
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.error.mockRestore();
    apiGetSpy.mockRestore();
    apiPatchSpy.mockRestore();
  });

  // --- Caso de prueba 1: Renderizado y obtención de datos exitosa ---
  it("should render and fetch patient appointments successfully", async () => {
    render(<DashboardPaciente />);

    expect(screen.getByText("Cargando tus citas...")).toBeInTheDocument();

    await waitFor(() => {
      expect(apiGetSpy).toHaveBeenCalledWith("reservas/", expect.anything());
    });

    expect(screen.queryByText("Cargando tus citas...")).not.toBeInTheDocument();
    expect(screen.getByText("Citas: 2")).toBeInTheDocument();
    expect(
      screen.getByText("Bienvenido, Paciente Mock 👋")
    ).toBeInTheDocument();
  });

  // --- Caso de prueba 2: Manejo de errores de la API ---
  it("should display an error message if fetching appointments fails", async () => {
    apiGetSpy.mockRejectedValue(new Error("Network error"));
    render(<DashboardPaciente />);

    await waitFor(() => {
      expect(
        screen.getByText("Error al cargar las citas. Intenta de nuevo.")
      ).toBeInTheDocument();
    });
  });

  // --- Caso de prueba 3: Flujo de cancelación de cita ---
  it("should handle the appointment cancellation flow correctly", async () => {
    render(<DashboardPaciente />);
    await waitFor(() => expect(apiGetSpy).toHaveBeenCalled());

    // 1. Simular clic en el botón de cancelar del AppointmentCalendar mock
    const cancelButton = screen.getAllByRole("button", { name: "Cancelar" })[0];
    fireEvent.click(cancelButton);

    // 2. Verificar que el modal de cancelación se muestre
    expect(screen.getByTestId("cancel-modal-mock")).toBeInTheDocument();
    expect(
      screen.getByText("¿Estás seguro de que deseas cancelar la cita?")
    ).toBeInTheDocument();

    // 3. Simular clic en el botón de confirmar dentro del modal
    const confirmButton = screen.getByRole("button", { name: "Confirmar" });
    fireEvent.click(confirmButton);

    // 4. Verificar que la llamada a la API se haya realizado
    await waitFor(() => {
      expect(apiPatchSpy).toHaveBeenCalledWith(
        "reservas/1/",
        { estado: "cancelada" },
        expect.anything()
      );
    });

    // 5. Verificar que el modal se haya cerrado y el estado de la cita se haya actualizado
    expect(screen.queryByTestId("cancel-modal-mock")).not.toBeInTheDocument();
    expect(screen.getByText("Citas: 2")).toBeInTheDocument();
  });

  // --- Caso de prueba 4: Mensaje de éxito de reserva ---
  it("should display a success message if bookingSuccess is true in location state", async () => {
    // Sobrescribimos el mock para este test específico, incluyendo el pathname
    useLocation.mockReturnValue({
      pathname: "/dashboard",
      state: { bookingSuccess: true },
    });

    jest.useFakeTimers();

    render(<DashboardPaciente />);

    expect(screen.getByText("Reserva hecha con éxito 🎉")).toBeInTheDocument();

    jest.advanceTimersByTime(1500);

    await waitFor(() => {
      expect(
        screen.queryByText("Reserva hecha con éxito 🎉")
      ).not.toBeInTheDocument();
      expect(mockNavigate).toHaveBeenCalledWith(expect.any(String), {
        replace: true,
        state: {},
      });
    });

    jest.useRealTimers();
  });
});
