import { useAuth0 } from "@auth0/auth0-react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import UsersAdmin from "./UsersAdmin";

// Mock de la dependencia de Auth0
jest.mock("@auth0/auth0-react");

describe("UsersAdmin", () => {
  const mockAccessToken = "fake-token";
  const mockUsers = [
    {
      id: "user1",
      email: "paciente1@example.com",
      first_name: "John",
      last_name: "Doe",
      role: "paciente",
    },
    {
      id: "user2",
      email: "doctor1@example.com",
      first_name: "Jane",
      last_name: "Smith",
      role: "doctor",
    },
    {
      id: "user3",
      email: "admin1@example.com",
      first_name: "Admin",
      last_name: "User",
      role: "admin",
    },
  ];

  beforeEach(() => {
    // Configura el mock de useAuth0 antes de cada test
    useAuth0.mockReturnValue({
      getAccessTokenSilently: jest.fn(() => Promise.resolve(mockAccessToken)),
    });

    // Mock global de fetch
    global.fetch = jest.fn();
    // Espiar console.error para evitar que los errores se muestren en la consola de prueba
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // Limpia los mocks después de cada test
    jest.clearAllMocks();
  });

  // Test de carga inicial y renderizado de datos
  it("should display a loading spinner initially and then the list of users", async () => {
    // Mock de la respuesta exitosa de la API
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    });

    // Envuelve el componente en un MemoryRouter
    render(
      <MemoryRouter>
        <UsersAdmin />
      </MemoryRouter>
    );

    // Verifica que el spinner de carga se muestra
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Cargando...")).toBeInTheDocument();

    // Espera hasta que el componente termine de cargar los datos
    await waitFor(() => {
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    });

    // Verifica que los usuarios correctos (paciente y doctor) se renderizan
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();

    // Verifica que el usuario administrador no se muestra
    expect(screen.queryByText("Admin User")).not.toBeInTheDocument();
  });

  // Test de manejo de errores
  it("should display an error message if fetching users fails", async () => {
    // Mock de una respuesta fallida de la API
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Server Error",
    });

    // Envuelve el componente en un MemoryRouter
    render(
      <MemoryRouter>
        <UsersAdmin />
      </MemoryRouter>
    );

    // Espera hasta que el mensaje de error aparezca
    await waitFor(() => {
      expect(
        screen.getByText("No se pudo cargar la lista de usuarios.")
      ).toBeInTheDocument();
    });
  });

  // Test de funcionalidad de búsqueda
  it("should filter users based on the search term", async () => {
    // Mock de la respuesta inicial
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockUsers),
    });

    // Envuelve el componente en un MemoryRouter
    render(
      <MemoryRouter>
        <UsersAdmin />
      </MemoryRouter>
    );

    // Espera a que los datos iniciales se carguen
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      "Buscar usuarios por nombre, apellido o email..."
    );

    // Simula una búsqueda por "Jane"
    await userEvent.type(searchInput, "Jane");

    // Verifica que fetchUsers se ha llamado con el término de búsqueda
    expect(global.fetch).toHaveBeenLastCalledWith(
      "http://localhost:8000/api/users/?search=Jane",
      expect.any(Object)
    );
  });

  // Test de la acción de promover a un doctor
  it("should call the promoteToDoctor API and re-fetch users", async () => {
    // Mock para la carga inicial y la respuesta de la promoción
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUsers),
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) }); // Respuesta de la promoción

    // Envuelve el componente en un MemoryRouter
    render(
      <MemoryRouter>
        <UsersAdmin />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const promoteButton = screen.getByRole("button", {
      name: /Promover a Doctor/i,
    });

    // Simula el clic en el botón de promover
    await userEvent.click(promoteButton);

    // Verifica que la llamada a la API de promoción fue correcta
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/users/user1/promote_to_doctor/",
      expect.objectContaining({ method: "PATCH" })
    );

    // Verifica que los usuarios se han vuelto a cargar después de la acción
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  // Test de la acción de degradar a un paciente
  it("should call the revertToPaciente API and re-fetch users", async () => {
    // Mock para la carga inicial y la respuesta de la degradación
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUsers),
      })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({}) }); // Respuesta de la degradación

    // Envuelve el componente en un MemoryRouter
    render(
      <MemoryRouter>
        <UsersAdmin />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    const revertButton = screen.getByRole("button", {
      name: /Degradar a Paciente/i,
    });

    // Simula el clic en el botón de degradar
    await userEvent.click(revertButton);

    // Verifica que la llamada a la API de degradación fue correcta
    expect(global.fetch).toHaveBeenCalledWith(
      "http://localhost:8000/api/users/user2/revert_to_paciente/",
      expect.objectContaining({ method: "PATCH" })
    );

    // Verifica que los usuarios se han vuelto a cargar después de la acción
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
