import { useAuth0 } from "@auth0/auth0-react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { useOutletContext } from "react-router-dom";
import ProfilePage from "./ProfilePage";

// Mocks de las dependencias
jest.mock("@auth0/auth0-react");
jest.mock("react-router-dom");
jest.mock("axios");

// Mock de los componentes hijos para aislarlos
jest.mock("../components/Sidebar", () => () => <div data-testid="sidebar" />);
jest.mock("../components/common/LoadingSpinner", () => ({ message }) => (
  <div data-testid="loading-spinner">{message}</div>
));
jest.mock("../components/common/ErrorMessage", () => ({ message }) => (
  <div data-testid="error-message">{message}</div>
));
jest.mock(
  "../components/profile/ProfileInfoCard",
  () =>
    ({
      user,
      profile,
      userRole,
      isEditing,
      phoneNumber,
      setPhoneNumber,
      specialty,
      setSpecialty,
      handleSaveProfile,
      handleCancelEdit,
      isSaving,
      setMessage,
      message,
      procedimientos,
      setIsEditing,
    }) =>
      (
        <div data-testid="profile-card">
          {isEditing ? (
            <>
              <input
                data-testid="phone-input"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              {userRole === "doctor" && (
                <input
                  data-testid="specialty-input"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                />
              )}
              <button data-testid="save-btn" onClick={handleSaveProfile}>
                Guardar
              </button>
              <button data-testid="cancel-btn" onClick={handleCancelEdit}>
                Cancelar
              </button>
            </>
          ) : (
            <>
              <div data-testid="display-phone">{profile.telefono}</div>
              {userRole === "doctor" && (
                <div data-testid="display-specialty">
                  {profile.especialidad}
                </div>
              )}
              <button data-testid="edit-btn" onClick={() => setIsEditing(true)}>
                Editar
              </button>
            </>
          )}
        </div>
      )
);

describe("ProfilePage", () => {
  const mockUser = {
    email: "testuser@example.com",
    given_name: "Test",
    family_name: "User",
  };
  const mockToken = "mock-token";

  beforeEach(() => {
    useAuth0.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      getAccessTokenSilently: jest.fn().mockResolvedValue(mockToken),
    });
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test Case 1: Carga y muestra el perfil del paciente
  it("debe cargar y mostrar el perfil del paciente correctamente", async () => {
    useOutletContext.mockReturnValue({ role: "paciente" });
    axios.get.mockResolvedValue({
      data: [{ user: mockUser, telefono: "123456789" }],
    });

    render(<ProfilePage />);

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
      expect(screen.getByTestId("profile-card")).toBeInTheDocument();
      expect(screen.getByTestId("display-phone")).toHaveTextContent(
        "123456789"
      );
    });
  });

  // Test Case 2: Carga y muestra el perfil del doctor
  it("debe cargar y mostrar el perfil del doctor correctamente", async () => {
    useOutletContext.mockReturnValue({ role: "doctor" });
    axios.get.mockResolvedValue({
      data: [
        { user: mockUser, telefono: "987654321", especialidad: "Odontología" },
      ],
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
      expect(screen.getByTestId("profile-card")).toBeInTheDocument();
      expect(screen.getByTestId("display-phone")).toHaveTextContent(
        "987654321"
      );
      expect(screen.getByTestId("display-specialty")).toHaveTextContent(
        "Odontología"
      );
    });
  });

  // Test Case 3: Maneja el rol de admin sin llamar a la API
  it("debe manejar el rol de admin sin hacer llamadas a la API", async () => {
    useOutletContext.mockReturnValue({ role: "admin" });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
      expect(screen.getByTestId("profile-card")).toBeInTheDocument();
    });

    // Asegura que axios.get no fue llamado
    expect(axios.get).not.toHaveBeenCalled();
  });

  // Test Case 4: Muestra un error si el perfil no se encuentra en la base de datos
  it("debe mostrar un mensaje de error si el perfil no se encuentra", async () => {
    useOutletContext.mockReturnValue({ role: "paciente" });
    axios.get.mockResolvedValue({ data: [] });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Perfil no encontrado en la base de datos."
      );
    });
  });

  // Test Case 5: Muestra un error si la llamada a la API falla
  it("debe mostrar un mensaje de error si la llamada a la API falla", async () => {
    useOutletContext.mockReturnValue({ role: "paciente" });
    axios.get.mockRejectedValue(new Error("Network Error"));

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Error al cargar el perfil."
      );
    });
  });

  // Test Case 6: Edita y guarda el perfil
  it("debe permitir editar y guardar el perfil del paciente", async () => {
    useOutletContext.mockReturnValue({ role: "paciente" });
    axios.get.mockResolvedValueOnce({
      data: [{ user: mockUser, telefono: "123456789" }],
    });
    axios.patch.mockResolvedValue({ data: { message: "Success" } });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId("edit-btn")).toBeInTheDocument();
    });

    userEvent.click(screen.getByTestId("edit-btn"));
    await waitFor(() => {
      expect(screen.getByTestId("phone-input")).toBeInTheDocument();
    });

    const phoneInput = screen.getByTestId("phone-input");
    await userEvent.clear(phoneInput);
    await userEvent.type(phoneInput, "999888777");

    userEvent.click(screen.getByTestId("save-btn"));

    await waitFor(() => {
      expect(axios.patch).toHaveBeenCalledWith(
        "http://localhost:8000/api/profile/update/",
        { telefono: "999888777" },
        expect.any(Object)
      );
    });
  });

  // Test Case 7: Cancela la edición
  it("debe cancelar la edición y revertir los datos", async () => {
    useOutletContext.mockReturnValue({ role: "paciente" });
    axios.get.mockResolvedValue({
      data: [{ user: mockUser, telefono: "123456789" }],
    });

    render(<ProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId("edit-btn")).toBeInTheDocument();
    });

    userEvent.click(screen.getByTestId("edit-btn"));
    await waitFor(() => {
      expect(screen.getByTestId("phone-input")).toBeInTheDocument();
    });

    const phoneInput = screen.getByTestId("phone-input");
    await userEvent.clear(phoneInput);
    await userEvent.type(phoneInput, "999888777");

    userEvent.click(screen.getByTestId("cancel-btn"));
    await waitFor(() => {
      expect(screen.queryByTestId("phone-input")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("display-phone")).toHaveTextContent("123456789");
  });
});
