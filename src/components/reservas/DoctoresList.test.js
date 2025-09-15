import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import DoctoresList from "./DoctoresList";

// Datos de prueba para simular una lista de doctores
const mockDoctores = [
  {
    id: 1,
    user: { first_name: "Dr. Juan", last_name: "Pérez" },
    especialidad: "Odontología General",
    telefono: "123456789",
  },
  {
    id: 2,
    user: { first_name: "Dra. Ana", last_name: "García" },
    especialidad: "Endodoncia",
    telefono: "987654321",
  },
];

describe("DoctoresList", () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    // Limpiar los mocks antes de cada prueba para evitar interferencias
    jest.clearAllMocks();
  });

  // --- Caso de prueba 1: Renderizado con lista vacía ---
  it("should render a message when the doctors list is empty", () => {
    render(<DoctoresList doctores={[]} onSelect={mockOnSelect} />);
    const noDoctorsMessage = screen.getByText(/No hay doctores disponibles./i);
    expect(noDoctorsMessage).toBeInTheDocument();
  });

  // --- Caso de prueba 2: Renderizado con lista de doctores ---
  it("should render the list of doctors with their information", () => {
    render(<DoctoresList doctores={mockDoctores} onSelect={mockOnSelect} />);

    // Verificar que se renderiza el título
    expect(screen.getByText("Selecciona un Doctor")).toBeInTheDocument();

    // Verificar que cada doctor se muestra en el documento
    expect(screen.getByText("Dr. Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("Odontología General")).toBeInTheDocument();
    expect(screen.getByText("Teléfono: 123456789")).toBeInTheDocument();

    expect(screen.getByText("Dra. Ana García")).toBeInTheDocument();
    expect(screen.getByText("Endodoncia")).toBeInTheDocument();
    expect(screen.getByText("Teléfono: 987654321")).toBeInTheDocument();

    // Verificar que los botones "Seleccionar" estén presentes
    const selectButtons = screen.getAllByRole("button", {
      name: "Seleccionar",
    });
    expect(selectButtons).toHaveLength(2);
  });

  // --- Caso de prueba 3: Manejo de la selección ---
  it("should call onSelect with the correct doctor when a card is clicked", () => {
    render(<DoctoresList doctores={mockDoctores} onSelect={mockOnSelect} />);

    // Encuentra el primer botón "Seleccionar" de la lista
    const firstDoctorButton = screen.getAllByRole("button", {
      name: "Seleccionar",
    })[0];
    fireEvent.click(firstDoctorButton);

    // Verifica que onSelect se haya llamado con el primer objeto de doctor
    expect(mockOnSelect).toHaveBeenCalledWith(mockDoctores[0]);
    expect(mockOnSelect).toHaveBeenCalledTimes(1);

    // Verifica que el estado del botón haya cambiado a "Seleccionado"
    expect(
      screen.getByRole("button", { name: "Seleccionado" })
    ).toBeInTheDocument();
  });
});
