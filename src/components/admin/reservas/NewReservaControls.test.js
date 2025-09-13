import { fireEvent, render, screen } from "@testing-library/react";
import { Views } from "react-big-calendar";
import NewReservaControls from "./NewReservaControls";

// Mock data for a new reservation
const mockNuevaReserva = {
  paciente: { nombre: "Juan Perez" },
  doctor: { nombre: "Dr. Smith" },
};

describe("NewReservaControls", () => {
  // Mock functions for the button actions
  const mockOnAddReserva = jest.fn();
  const mockOnSaveReserva = jest.fn();
  const mockOnCancelReserva = jest.fn();

  beforeEach(() => {
    // Clear mock calls before each test
    jest.clearAllMocks();
  });

  // --- Test Case 1: Initial state (no new reservation, not in WEEK view) ---
  it("should render null if no new reservation and not in WEEK view", () => {
    const { container } = render(
      <NewReservaControls
        nuevaReserva={null}
        guardando={false}
        onAddReserva={mockOnAddReserva}
        onSaveReserva={mockOnSaveReserva}
        onCancelReserva={mockOnCancelReserva}
        currentView={Views.DAY} // Or any view other than WEEK
      />
    );
    // The component should not render any HTML
    expect(container).toBeEmptyDOMElement();
  });

  // --- Test Case 2: In WEEK view, no new reservation ---
  it('should render "Agregar Reserva" button when in WEEK view and no new reservation', () => {
    render(
      <NewReservaControls
        nuevaReserva={null}
        guardando={false}
        onAddReserva={mockOnAddReserva}
        onSaveReserva={mockOnSaveReserva}
        onCancelReserva={mockOnCancelReserva}
        currentView={Views.WEEK}
      />
    );
    const addButton = screen.getByRole("button", { name: /Agregar Reserva/i });
    expect(addButton).toBeInTheDocument();
  });

  // --- Test Case 3: New reservation is present ---
  it("should render reservation details and control buttons when a new reservation is present", () => {
    render(
      <NewReservaControls
        nuevaReserva={mockNuevaReserva}
        guardando={false}
        onAddReserva={mockOnAddReserva}
        onSaveReserva={mockOnSaveReserva}
        onCancelReserva={mockOnCancelReserva}
        currentView={Views.WEEK}
      />
    );
    // Check for patient and doctor names
    expect(
      screen.getByText(/Reserva nueva: Juan Perez con Dr. Smith/i)
    ).toBeInTheDocument();

    // Check for the "Reservar" and "Cancelar" buttons
    const saveButton = screen.getByRole("button", { name: /Reservar/i });
    const cancelButton = screen.getByRole("button", { name: /Cancelar/i });
    expect(saveButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();
  });

  // --- Test Case 4: The "Reservar" button state when saving ---
  it("should show 'Guardando...' and disable the save button when saving", () => {
    render(
      <NewReservaControls
        nuevaReserva={mockNuevaReserva}
        guardando={true}
        onAddReserva={mockOnAddReserva}
        onSaveReserva={mockOnSaveReserva}
        onCancelReserva={mockOnCancelReserva}
        currentView={Views.WEEK}
      />
    );
    const saveButton = screen.getByRole("button", { name: /Guardando.../i });
    expect(saveButton).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
  });

  // --- Test Case 5: Verify button click actions ---
  it("should call the correct function when a button is clicked", () => {
    // Test the "Agregar Reserva" button
    render(
      <NewReservaControls
        nuevaReserva={null}
        guardando={false}
        onAddReserva={mockOnAddReserva}
        onSaveReserva={mockOnSaveReserva}
        onCancelReserva={mockOnCancelReserva}
        currentView={Views.WEEK}
      />
    );
    const addButton = screen.getByRole("button", { name: /Agregar Reserva/i });
    fireEvent.click(addButton);
    expect(mockOnAddReserva).toHaveBeenCalledTimes(1);

    // Test the "Reservar" and "Cancelar" buttons
    const { rerender } = render(
      <NewReservaControls
        nuevaReserva={mockNuevaReserva}
        guardando={false}
        onAddReserva={mockOnAddReserva}
        onSaveReserva={mockOnSaveReserva}
        onCancelReserva={mockOnCancelReserva}
        currentView={Views.WEEK}
      />
    );
    const saveButton = screen.getByRole("button", { name: /Reservar/i });
    const cancelButton = screen.getByRole("button", { name: /Cancelar/i });

    fireEvent.click(saveButton);
    expect(mockOnSaveReserva).toHaveBeenCalledTimes(1);

    fireEvent.click(cancelButton);
    expect(mockOnCancelReserva).toHaveBeenCalledTimes(1);
  });
});
