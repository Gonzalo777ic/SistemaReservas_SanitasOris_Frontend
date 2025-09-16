import { useAuth0 } from "@auth0/auth0-react";
import { render, screen, waitFor } from "@testing-library/react";
import { api } from "../services/api";
import HorarioDoctorPage from "./HorarioDoctorPage";

// Mockear el hook de Auth0
jest.mock("@auth0/auth0-react");

// Mockear las llamadas a la API
jest.mock("../services/api");

// Mockear los componentes hijos para una prueba más simple y aislada
jest.mock("../components/Sidebar", () => () => <div data-testid="sidebar" />);
jest.mock(
  "../components/doctor/horarios/HorarioCalendar",
  () =>
    ({ onSelectSlot, onSelectEvent, onAddHorarioClick }) =>
      (
        <div data-testid="horario-calendar">
          <button onClick={onAddHorarioClick}>Agregar Horario</button>
        </div>
      )
);
jest.mock("../components/doctor/horarios/HorarioTemplates", () => () => (
  <div data-testid="horario-templates" />
));
jest.mock("../components/doctor/horarios/HorarioTable", () => () => (
  <div data-testid="horario-table" />
));
jest.mock("../components/doctor/horarios/HorarioForms", () => () => (
  <div data-testid="horario-forms" />
));
jest.mock(
  "../components/doctor/horarios/HorarioConfirmationModals",
  () => () => <div data-testid="horario-modals" />
);

describe("HorarioDoctorPage", () => {
  // Configura los mocks antes de cada prueba
  beforeEach(() => {
    // Simula los valores retornados por el hook useAuth0
    useAuth0.mockReturnValue({
      user: { email: "doctor@example.com" },
      getAccessTokenSilently: jest.fn().mockResolvedValue("mock-token"),
    });

    // Simula las respuestas de la API
    api.get.mockImplementation((url) => {
      if (url.includes("doctores")) {
        return Promise.resolve({
          data: [
            {
              id: 123,
              email: "doctor@example.com",
              user: { email: "doctor@example.com" },
            },
          ],
        });
      }
      if (url.includes("horarios-semanales")) {
        return Promise.resolve({ data: [] });
      }
      // La llamada de horarios debe ir después de la de doctor para que el ID exista
      if (url.includes("horarios")) {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error("URL de API no mockeada: " + url));
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("debe renderizar la página y sus componentes principales", async () => {
    // La prueba ahora usa async/await para manejar las actualizaciones de estado
    render(<HorarioDoctorPage />);

    // Espera a que la lógica del useEffect se complete y los componentes se rendericen
    await waitFor(() => {
      expect(
        screen.getByText("Gestionar Horario de Disponibilidad")
      ).toBeInTheDocument();
      expect(screen.getByTestId("sidebar")).toBeInTheDocument();
      expect(screen.getByTestId("horario-calendar")).toBeInTheDocument();
      expect(screen.getByTestId("horario-templates")).toBeInTheDocument();
      expect(screen.getByTestId("horario-table")).toBeInTheDocument();
    });
  });

  it("debe llamar a las funciones de fetch correctas al renderizar", async () => {
    render(<HorarioDoctorPage />);

    // Espera a que todas las llamadas de la API se hayan completado.
    await waitFor(() => {
      // Ahora esperamos 3 llamadas a `api.get` en total, no 2.
      expect(api.get).toHaveBeenCalledTimes(3);

      // Verificamos la primera llamada para obtener el ID del doctor
      expect(api.get).toHaveBeenCalledWith("doctores/", expect.any(Object));

      // Verificamos las dos llamadas para horarios y plantillas, que usan el ID del doctor
      expect(api.get).toHaveBeenCalledWith(
        "horarios/?doctor_id=123",
        expect.any(Object)
      );
      expect(api.get).toHaveBeenCalledWith(
        "horarios-semanales/?doctor_id=123",
        expect.any(Object)
      );
    });
  });
});
