import { useAuth0 } from "@auth0/auth0-react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import PatientsAdmin from "./PatientsAdmin";

// Mockear el hook de Auth0
jest.mock("@auth0/auth0-react");

// Mockear los componentes hijos para aislar la prueba
jest.mock("../components/Sidebar", () => () => <div data-testid="sidebar" />);
jest.mock(
  "../components/admin/patients/PatientSearchBar",
  () =>
    ({ searchTerm, setSearchTerm }) =>
      (
        <input
          data-testid="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      )
);
jest.mock(
  "../components/admin/patients/PatientsTable",
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

describe("PatientsAdmin", () => {
  const mockPatients = [
    { id: 1, nombre: "Ana García" },
    { id: 2, nombre: "Juan Pérez" },
    { id: 3, nombre: "María López" },
  ];

  const mockToken = "mock-token";

  let fetchSpy;

  beforeEach(() => {
    // Configurar el mock de Auth0 antes de cada prueba
    useAuth0.mockReturnValue({
      getAccessTokenSilently: jest.fn().mockResolvedValue(mockToken),
    });

    // Mockear la API global fetch
    fetchSpy = jest.spyOn(global, "fetch");

    // Configuración por defecto para las respuestas exitosas de fetch
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockPatients),
      status: 200,
      statusText: "OK",
    });
  });

  afterEach(() => {
    // Limpiar los mocks después de cada prueba
    jest.clearAllMocks();
  });

  it("debe mostrar el estado de carga y luego la tabla de pacientes", async () => {
    render(<PatientsAdmin />);

    // Verifica el estado inicial de carga
    expect(screen.getByText("Cargando...")).toBeInTheDocument();

    // Espera a que la carga de datos se complete
    await waitFor(() => {
      // Verifica que el estado de carga desaparezca
      expect(screen.queryByText("Cargando...")).not.toBeInTheDocument();
      // Verifica que la tabla de pacientes esté renderizada
      expect(screen.getByTestId("patients-table")).toBeInTheDocument();
      // Verifica que los pacientes se muestren
      expect(screen.getByText("Ana García")).toBeInTheDocument();
      expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    });

    // Verifica que la llamada a fetch se hizo con los parámetros correctos
    expect(fetchSpy).toHaveBeenCalledWith(
      "http://localhost:8000/api/pacientes/?search=",
      {
        headers: { Authorization: `Bearer ${mockToken}` },
      }
    );
  });

  it("debe mostrar un mensaje de error si la llamada a la API falla", async () => {
    // Configura fetch para que falle
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Server Error",
    });

    render(<PatientsAdmin />);

    // Espera a que el componente maneje el error
    await waitFor(() => {
      expect(
        screen.getByText("No se pudo cargar la lista de pacientes.")
      ).toBeInTheDocument();
      expect(screen.queryByText("Cargando...")).not.toBeInTheDocument();
    });
  });

  it("debe filtrar la lista de pacientes cuando se cambia el término de búsqueda", async () => {
    render(<PatientsAdmin />);

    // Espera el renderizado inicial y que la tabla se llene
    await waitFor(() => {
      expect(screen.getByText("Ana García")).toBeInTheDocument();
    });

    // Mockear la respuesta de fetch para la búsqueda
    fetchSpy.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([{ id: 2, nombre: "Juan Pérez" }]),
      status: 200,
    });

    // Simular que el usuario escribe en la barra de búsqueda
    const searchInput = screen.getByTestId("search-bar");
    fireEvent.change(searchInput, { target: { value: "Juan" } });

    // Espera a que el componente re-renderice con los resultados de la búsqueda
    await waitFor(() => {
      expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
      expect(screen.queryByText("Ana García")).not.toBeInTheDocument();
    });

    // Verifica que fetch se llamó de nuevo con el término de búsqueda correcto
    expect(fetchSpy).toHaveBeenCalledWith(
      "http://localhost:8000/api/pacientes/?search=Juan",
      {
        headers: { Authorization: `Bearer ${mockToken}` },
      }
    );
  });
});
