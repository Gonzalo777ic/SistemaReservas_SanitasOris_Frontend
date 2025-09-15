import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { api } from "../services/api";
import AddNotesModal from "./AddNotesModal";

// Mock de la API para simular las llamadas HTTP
jest.mock("../services/api");

const mockReserva = {
  id: 1,
  paciente: { user: { first_name: "Ana", last_name: "García" } },
  procedimiento: { nombre: "Revisión general" },
  fecha_hora: "2025-10-23T15:30:00Z",
  estado: "pendiente",
  notas_doctor: "Notas iniciales de la cita.",
};

describe("AddNotesModal", () => {
  const mockOnHide = jest.fn();
  const mockOnNotesAdded = jest.fn();
  const mockToken = "mock-token-123";

  beforeEach(() => {
    // Limpiar mocks antes de cada prueba
    jest.clearAllMocks();
  });

  // --- Caso 1: Renderizado inicial y pre-carga de notas ---
  it("should render the modal with initial notes and correct title", () => {
    render(
      <AddNotesModal
        show={true}
        onHide={mockOnHide}
        reserva={mockReserva}
        token={mockToken}
      />
    );

    // Verificar el título del modal
    expect(screen.getByText("Notas sobre la Cita de Ana")).toBeInTheDocument();

    // Verificar que el textarea se pre-cargue con las notas existentes
    const notesTextarea = screen.getByPlaceholderText(
      /Escribe tus notas aquí.../i
    );
    expect(notesTextarea).toHaveValue(mockReserva.notas_doctor);
  });

  // --- Caso 2: Manejo de la entrada de usuario ---
  it("should update the notes state when the user types in the textarea", () => {
    render(
      <AddNotesModal
        show={true}
        onHide={mockOnHide}
        reserva={mockReserva}
        token={mockToken}
      />
    );

    const notesTextarea = screen.getByPlaceholderText(
      /Escribe tus notas aquí.../i
    );
    const newNotes = "Se revisó la dentadura con éxito. Todo en orden.";

    fireEvent.change(notesTextarea, { target: { value: newNotes } });

    expect(notesTextarea).toHaveValue(newNotes);
  });

  // --- Caso 3: Guardado exitoso de notas ---
  it("should call the API, show success message, call onNotesAdded, and close the modal on successful save", async () => {
    // Usar temporizadores falsos para controlar el setTimeout
    jest.useFakeTimers();

    api.patch.mockResolvedValueOnce({ status: 200 });

    render(
      <AddNotesModal
        show={true}
        onHide={mockOnHide}
        reserva={mockReserva}
        token={mockToken}
        onNotesAdded={mockOnNotesAdded}
      />
    );

    const newNotes = "Se revisó la dentadura con éxito.";
    const notesTextarea = screen.getByPlaceholderText(
      /Escribe tus notas aquí.../i
    );
    fireEvent.change(notesTextarea, { target: { value: newNotes } });

    const saveButton = screen.getByRole("button", { name: /Guardar Notas/i });
    fireEvent.click(saveButton);

    // Esperar a que la llamada a la API se complete
    await waitFor(() => {
      expect(api.patch).toHaveBeenCalledWith(
        `reservas/${mockReserva.id}/`,
        { notas_doctor: newNotes },
        { headers: { Authorization: `Bearer ${mockToken}` } }
      );
    });

    // Verificar el mensaje de éxito después de esperar a que la UI se actualice
    await waitFor(() => {
      expect(
        screen.getByText("Notas guardadas exitosamente!")
      ).toBeInTheDocument();
    });

    // Verificar que onNotesAdded se llame con el objeto de reserva actualizado
    expect(mockOnNotesAdded).toHaveBeenCalledWith({
      ...mockReserva,
      notas_doctor: newNotes,
    });

    // Avanzar los temporizadores para que se ejecute el setTimeout
    jest.advanceTimersByTime(1500);

    // Verificar que el modal se cierre
    expect(mockOnHide).toHaveBeenCalledTimes(1);

    jest.useRealTimers();
  });

  // --- Caso 4: Manejo de error al guardar notas ---
  it("should show an error message when saving notes fails", async () => {
    api.patch.mockRejectedValueOnce(new Error("API Error"));

    render(
      <AddNotesModal
        show={true}
        onHide={mockOnHide}
        reserva={mockReserva}
        token={mockToken}
      />
    );

    const saveButton = screen.getByRole("button", { name: /Guardar Notas/i });
    fireEvent.click(saveButton);

    // Esperar a que el estado de error se actualice
    await waitFor(() => {
      expect(
        screen.getByText("Error al guardar las notas. Intenta de nuevo.")
      ).toBeInTheDocument();
    });

    // Verificar que el modal no se cierre en caso de error
    expect(mockOnHide).not.toHaveBeenCalled();
  });
});
