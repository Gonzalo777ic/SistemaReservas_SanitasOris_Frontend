import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import ContactInfoSection from "./ContactInfoSection";

// Mock de las props para usar en las pruebas
const mockProps = {
  profile: {
    telefono: "123-456-7890",
  },
  isEditing: false,
  phoneNumber: "",
  setPhoneNumber: jest.fn(),
  handleSaveProfile: jest.fn(),
  handleCancelEdit: jest.fn(),
  isSaving: false,
  setIsEditing: jest.fn(),
};

describe("ContactInfoSection", () => {
  beforeEach(() => {
    // Limpiamos los mocks antes de cada prueba
    jest.clearAllMocks();
  });

  // --- Pruebas para el estado de visualización (no editando) ---

  it("should render correctly in view mode for a patient", () => {
    render(<ContactInfoSection {...mockProps} userRole="paciente" />);

    // Verificamos que el título y el teléfono se muestren
    expect(screen.getByText("Datos de Contacto")).toBeInTheDocument();
    expect(screen.getByText("123-456-7890")).toBeInTheDocument();
    // El botón 'Editar' debe estar visible y los de guardar/cancelar no
    expect(screen.getByRole("button", { name: "Editar" })).toBeInTheDocument();
    expect(screen.queryByText("Guardar")).not.toBeInTheDocument();
  });

  it("should render 'No especificado' if phone number is missing in view mode", () => {
    // Renderizamos con un teléfono no especificado
    const props = {
      ...mockProps,
      profile: { telefono: null },
      userRole: "paciente",
    };
    render(<ContactInfoSection {...props} />);

    expect(screen.getByText("No especificado")).toBeInTheDocument();
  });

  // --- Pruebas para el estado de edición ---

  it("should render correctly in edit mode for a doctor", () => {
    // Agregamos un número de teléfono a las props para que el campo de entrada tenga un valor.
    const props = {
      ...mockProps,
      isEditing: true,
      userRole: "doctor",
      phoneNumber: "123-456-7890",
    };
    render(<ContactInfoSection {...props} />);

    // Un campo de entrada debe reemplazar al texto del teléfono.
    // CORRECCIÓN: Usamos getByDisplayValue para encontrar la entrada por el valor que contiene.
    const phoneInput = screen.getByDisplayValue("123-456-7890");
    expect(phoneInput).toBeInTheDocument();

    // Los botones 'Guardar' y 'Cancelar' deben estar visibles
    expect(screen.getByRole("button", { name: "Guardar" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cancelar" })
    ).toBeInTheDocument();
    // El botón 'Editar' no debe estar visible
    expect(
      screen.queryByRole("button", { name: "Editar" })
    ).not.toBeInTheDocument();
  });

  it("should call setIsEditing when 'Editar' button is clicked", () => {
    render(<ContactInfoSection {...mockProps} userRole="paciente" />);

    const editButton = screen.getByRole("button", { name: "Editar" });
    fireEvent.click(editButton);

    expect(mockProps.setIsEditing).toHaveBeenCalledTimes(1);
    expect(mockProps.setIsEditing).toHaveBeenCalledWith(true);
  });

  it("should call handleSaveProfile when 'Guardar' button is clicked", () => {
    const props = { ...mockProps, isEditing: true, userRole: "doctor" };
    render(<ContactInfoSection {...props} />);

    const saveButton = screen.getByRole("button", { name: "Guardar" });
    fireEvent.click(saveButton);

    expect(mockProps.handleSaveProfile).toHaveBeenCalledTimes(1);
  });

  it("should call handleCancelEdit when 'Cancelar' button is clicked", () => {
    const props = { ...mockProps, isEditing: true, userRole: "doctor" };
    render(<ContactInfoSection {...props} />);

    const cancelButton = screen.getByRole("button", { name: "Cancelar" });
    fireEvent.click(cancelButton);

    expect(mockProps.handleCancelEdit).toHaveBeenCalledTimes(1);
  });

  // --- Pruebas para roles no permitidos ---

  it("should render admin panel message for an admin user", () => {
    render(<ContactInfoSection {...mockProps} userRole="admin" />);

    // CORRECCIÓN: Usamos una expresión regular para una coincidencia de texto más flexible.
    expect(
      screen.getByText(/Modificar desde el panel de administración/)
    ).toBeInTheDocument();
    // Los botones de edición no deben estar visibles
    expect(
      screen.queryByRole("button", { name: "Editar" })
    ).not.toBeInTheDocument();
  });
});
