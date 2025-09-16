import { useAuth0 } from "@auth0/auth0-react";
import { render, screen, waitFor } from "@testing-library/react";
import { api } from "../services/api";
import PacientesDoctorPage from "./PacientesDoctorPage";

// Mockear el hook de Auth0
jest.mock("@auth0/auth0-react");

// Mockear las llamadas a la API
jest.mock("../services/api");

// Mockear los componentes hijos para aislar la prueba
jest.mock("../components/Sidebar", () => () => <div data-testid="sidebar" />);
jest.mock(
  "../components/doctor/patients/DoctorPatientsTable",
  () =>
    ({ patients }) =>
      (
        <div data-testid="patients-table">
          {patients.map((p) => (
            <div key={p.id}>{p.nombre}</div>
          ))}
        </div>
      )
);

describe("PacientesDoctorPage", () => {
  const mockReservations = [
    { id: 1, paciente: { id: 101, nombre: "Ana García" } },
    { id: 2, paciente: { id: 102, nombre: "Juan Pérez" } },
    { id: 3, paciente: { id: 101, nombre: "Ana García" } }, // Paciente duplicado
  ];

  beforeEach(() => {
    // Simula los valores retornados por el hook useAuth0
    useAuth0.mockReturnValue({
      getAccessTokenSilently: jest.fn().mockResolvedValue("mock-token"),
    });

    // Simula la respuesta exitosa de la API
    api.get.mockResolvedValue({ data: mockReservations });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("debe mostrar el estado de carga y luego la tabla de pacientes", async () => {
    render(<PacientesDoctorPage />);

    // Verifica el estado inicial de carga
    expect(screen.getByText("Cargando pacientes...")).toBeInTheDocument();

    // Espera a que la carga de datos se complete
    await waitFor(() => {
      // Verifica que el estado de carga desaparezca
      expect(
        screen.queryByText("Cargando pacientes...")
      ).not.toBeInTheDocument();
      // Verifica que la tabla de pacientes esté renderizada
      expect(screen.getByTestId("patients-table")).toBeInTheDocument();
      // Verifica que los pacientes únicos se muestren en la tabla
      expect(screen.getByText("Ana García")).toBeInTheDocument();
      expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
      // Verifica que no haya duplicados
      const patientsRendered = screen.getAllByText(/García|Pérez/);
      expect(patientsRendered).toHaveLength(2);
    });
  });

  it("debe mostrar un mensaje de error si la llamada a la API falla", async () => {
    // Configura la API para que falle
    api.get.mockRejectedValue(new Error("Error de red"));

    render(<PacientesDoctorPage />);

    // Espera a que el componente maneje el error
    await waitFor(() => {
      expect(
        screen.getByText("Error al cargar la lista de pacientes.")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Cargando pacientes...")
      ).not.toBeInTheDocument();
    });
  });

  it("debe llamar a la API con el endpoint y headers correctos", async () => {
    const getAccessTokenSilently = useAuth0().getAccessTokenSilently;

    render(<PacientesDoctorPage />);

    await waitFor(() => {
      expect(getAccessTokenSilently).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledTimes(1);
      expect(api.get).toHaveBeenCalledWith("reservas/", {
        headers: { Authorization: "Bearer mock-token" },
      });
    });
  });
});
