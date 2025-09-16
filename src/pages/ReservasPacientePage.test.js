import { useAuth0 } from "@auth0/auth0-react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import ReservasPacientePage from "./ReservasPacientePage";

// Mock de las dependencias
jest.mock("@auth0/auth0-react");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));
jest.mock("../services/api");

// Mock de los componentes hijos para aislarlos
jest.mock("../components/Sidebar", () => () => <div data-testid="sidebar" />);
jest.mock(
  "../components/reservas/ProcedimientosCarousel",
  () =>
    ({ onSelect }) =>
      (
        <div data-testid="procedimientos-carousel">
          <button
            onClick={() =>
              onSelect({ id: 1, nombre: "Procedimiento A", duracion_min: 30 })
            }
            data-testid="select-procedimiento-btn"
          >
            Seleccionar Procedimiento A
          </button>
        </div>
      )
);
jest.mock(
  "../components/reservas/DoctoresList",
  () =>
    ({ doctores, onSelect }) =>
      (
        <div data-testid="doctores-list">
          {doctores.map((doc) => (
            <button
              key={doc.id}
              onClick={() => onSelect(doc)}
              data-testid={`select-doctor-${doc.id}`}
            >
              {doc.nombre}
            </button>
          ))}
        </div>
      )
);

// Usamos una fecha estática en lugar de moment() para evitar el error de Jest
jest.mock(
  "../components/reservas/paciente/CalendarioReservas",
  () =>
    ({
      disponibilidad,
      setFechaHoraSeleccionada,
      setPendingEvent,
      pendingEvent,
    }) =>
      (
        <div data-testid="calendario-reservas">
          <button
            onClick={() => {
              const fecha = "2025-10-15T10:00:00"; // Fecha de prueba estática
              setFechaHoraSeleccionada(fecha);
              setPendingEvent({ start: fecha });
            }}
            data-testid="select-fecha-btn"
          >
            Seleccionar Fecha y Hora
          </button>
        </div>
      )
);
jest.mock(
  "../components/reservas/paciente/BookingSuccessModal",
  () =>
    ({ show, onHide }) =>
      (
        <div
          data-testid="booking-success-modal"
          style={{ display: show ? "block" : "none" }}
        >
          Modal de Éxito
          <button onClick={onHide} data-testid="modal-close-btn">
            Cerrar
          </button>
        </div>
      )
);

describe("ReservasPacientePage", () => {
  const mockUser = {
    email: "paciente@test.com",
    name: "Paciente Test",
  };
  const mockProcedimientos = [
    { id: 1, nombre: "Procedimiento A", duracion_min: 30 },
  ];
  const mockDoctores = [
    { id: 1, nombre: "Dr. Carlos", especialidad: "Odontología" },
  ];
  const mockDisponibilidad = {
    bloques: [],
    citas: [],
  };
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useAuth0.mockReturnValue({
      user: mockUser,
      getAccessTokenSilently: jest.fn().mockResolvedValue("mock-token"),
    });
    useNavigate.mockReturnValue(mockNavigate);

    // Mockear las llamadas iniciales de la API
    api.get.mockImplementation((url, config) => {
      if (url.includes("procedimientos")) {
        return Promise.resolve({ data: mockProcedimientos });
      }
      if (url.includes("doctores")) {
        return Promise.resolve({ data: mockDoctores });
      }
      if (url.includes("pacientes/by_email")) {
        return Promise.resolve({ data: { id: 101 } });
      }
      if (url.includes("reservas/disponibilidad")) {
        return Promise.resolve({ data: mockDisponibilidad });
      }
      return Promise.reject(new Error("URL no reconocida"));
    });
    api.post.mockResolvedValue({ data: { message: "Reserva creada" } });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test Case 1: Renderiza la página después de una carga exitosa
  it("debe renderizar la página y los componentes después de una carga exitosa", async () => {
    render(<ReservasPacientePage />, { wrapper: BrowserRouter });
    await waitFor(() => {
      expect(screen.getByText("Reservar nueva cita")).toBeInTheDocument();
      expect(
        screen.getByText(`Paciente: ${mockUser.name}`)
      ).toBeInTheDocument();
      expect(screen.getByText("1. Elige un procedimiento")).toBeInTheDocument();
      expect(screen.getByTestId("procedimientos-carousel")).toBeInTheDocument();
    });
  });

  // Test Case 2: Muestra un mensaje de error si la carga de datos inicial falla
  it("debe mostrar un mensaje de error si la carga de datos inicial falla", async () => {
    api.get.mockRejectedValueOnce(new Error("Network Error"));
    render(<ReservasPacientePage />, { wrapper: BrowserRouter });
    await waitFor(() => {
      expect(
        screen.getByText("❌ Error al cargar los datos.")
      ).toBeInTheDocument();
    });
  });

  // Test Case 3: Muestra el botón de confirmación después de seleccionar doctor y fecha
  it("debe mostrar el botón de confirmación después de seleccionar doctor y fecha", async () => {
    render(<ReservasPacientePage />, { wrapper: BrowserRouter });
    const selectProcedimientoBtn = await screen.findByTestId(
      "select-procedimiento-btn"
    );
    await userEvent.click(selectProcedimientoBtn);

    const selectDoctorBtn = await screen.findByTestId("select-doctor-1");
    await userEvent.click(selectDoctorBtn);

    await waitFor(() => {
      expect(screen.getByTestId("calendario-reservas")).toBeInTheDocument();
    });

    const selectFechaBtn = screen.getByTestId("select-fecha-btn");
    await userEvent.click(selectFechaBtn);

    await waitFor(() => {
      expect(screen.getByText("Confirmar Cita")).toBeInTheDocument();
    });
  });

  // Test Case 4: Realiza una reserva exitosa y muestra el modal de éxito
  it("debe realizar una reserva exitosa y mostrar el modal de éxito", async () => {
    render(<ReservasPacientePage />, { wrapper: BrowserRouter });

    // 1. Seleccionar procedimiento
    const selectProcedimientoBtn = await screen.findByTestId(
      "select-procedimiento-btn"
    );
    await userEvent.click(selectProcedimientoBtn);

    // 2. Seleccionar doctor
    const selectDoctorBtn = await screen.findByTestId("select-doctor-1");
    await userEvent.click(selectDoctorBtn);

    // 3. Seleccionar fecha y hora
    const selectFechaBtn = await screen.findByTestId("select-fecha-btn");
    await userEvent.click(selectFechaBtn);

    // 4. Confirmar la reserva
    const confirmarCitaBtn = await screen.findByText("Confirmar Cita");
    await userEvent.click(confirmarCitaBtn);

    // 5. Verificar las llamadas a la API
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(
        `pacientes/by_email/${mockUser.email}/`,
        expect.anything()
      );
      expect(api.post).toHaveBeenCalledWith(
        "reservas/",
        expect.objectContaining({
          paciente_id: 101,
          doctor_id: 1,
          procedimiento_id: 1,
        }),
        expect.anything()
      );
    });

    // 6. Verificar que se muestra el modal de éxito
    await waitFor(() => {
      expect(screen.getByTestId("booking-success-modal")).toHaveStyle(
        "display: block"
      );
    });
  });

  // Test Case 5: Muestra un mensaje de error si la reserva falla
  it("debe mostrar un mensaje de error si la reserva falla", async () => {
    api.post.mockRejectedValue(new Error("Error al reservar"));

    render(<ReservasPacientePage />, { wrapper: BrowserRouter });

    // 1. Seleccionar procedimiento
    const selectProcedimientoBtn = await screen.findByTestId(
      "select-procedimiento-btn"
    );
    await userEvent.click(selectProcedimientoBtn);

    // 2. Seleccionar doctor
    const selectDoctorBtn = await screen.findByTestId("select-doctor-1");
    await userEvent.click(selectDoctorBtn);

    // 3. Seleccionar fecha y hora
    const selectFechaBtn = await screen.findByTestId("select-fecha-btn");
    await userEvent.click(selectFechaBtn);

    // 4. Confirmar la reserva
    const confirmarCitaBtn = await screen.findByText("Confirmar Cita");
    await userEvent.click(confirmarCitaBtn);

    // 5. Verificar que se muestra el mensaje de error
    await waitFor(() => {
      expect(
        screen.getByText("❌ Ocurrió un error al reservar la cita.")
      ).toBeInTheDocument();
    });
  });
});
