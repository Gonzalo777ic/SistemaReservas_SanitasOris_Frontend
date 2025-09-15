import { fireEvent, render, screen } from "@testing-library/react";
import CitasTable from "./CitasTable";

// Mock de la data de reservas para los tests
const mockReservas = [
  {
    id: 1,
    fecha_hora: "2025-10-23T15:30:00Z",
    paciente: { user: { first_name: "Ana", last_name: "García" } },
    procedimiento: { nombre: "Revisión general" },
    estado: "pendiente",
    notas_doctor: "Revisión completa.",
  },
  {
    id: 2,
    fecha_hora: "2025-10-24T10:00:00Z",
    paciente: { user: { first_name: "Pedro", last_name: "Pérez" } },
    procedimiento: { nombre: "Limpieza dental" },
    estado: "confirmada",
    notas_doctor: "Sin notas.",
  },
  {
    id: 3,
    fecha_hora: "2025-10-25T14:00:00Z",
    paciente: { user: { first_name: "María", last_name: "López" } },
    procedimiento: { nombre: "Extracción" },
    estado: "cancelada",
    notas_doctor: "Cancelación por emergencia.",
  },
  {
    id: 4,
    fecha_hora: "2025-10-26T09:00:00Z",
    paciente: { user: { first_name: "Juan", last_name: "Rodríguez" } },
    procedimiento: { nombre: "Blanqueamiento" },
    estado: "completada",
    notas_doctor: "Cita completada.",
  },
];

describe("CitasTable", () => {
  // Mock de las funciones de manejo
  const mockSetShowDetailsModal = jest.fn();
  const mockSetSelectedReserva = jest.fn();
  const mockSetShowNotesModal = jest.fn();
  const mockSetReservaToUpdate = jest.fn();
  const mockSetNewStatusToApply = jest.fn();
  const mockSetShowConfirmModal = jest.fn();
  const mockSetShowCancelModal = jest.fn();

  const defaultProps = {
    reservas: mockReservas,
    loading: false,
    error: null,
    setShowDetailsModal: mockSetShowDetailsModal,
    setSelectedReserva: mockSetSelectedReserva,
    setShowNotesModal: mockSetShowNotesModal,
    setReservaToUpdate: mockSetReservaToUpdate,
    setNewStatusToApply: mockSetNewStatusToApply,
    setShowConfirmModal: mockSetShowConfirmModal,
    setShowCancelModal: mockSetShowCancelModal,
  };

  // --- Caso de prueba 1: Renderizado básico con datos ---
  it("should render the table with appointment data", () => {
    render(<CitasTable {...defaultProps} />);

    // Verificar que las cabeceras de la tabla están presentes
    expect(
      screen.getByRole("columnheader", { name: /fecha y hora/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /paciente/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /procedimiento/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /estado/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /acciones/i })
    ).toBeInTheDocument();

    // Verificar que los datos de las citas se rendericen correctamente
    expect(screen.getByText(/Ana García/i)).toBeInTheDocument();
    expect(screen.getByText(/Revisión general/i)).toBeInTheDocument();
    expect(screen.getByText(/Limpieza dental/i)).toBeInTheDocument();
    expect(screen.getByText(/Pedro Pérez/i)).toBeInTheDocument();
    expect(screen.getByText(/Extracción/i)).toBeInTheDocument();
    expect(screen.getByText(/María López/i)).toBeInTheDocument();
  });

  // --- Caso de prueba 2: Estado de carga ---
  it("should display a loading message when loading is true", () => {
    render(<CitasTable {...defaultProps} loading={true} />);
    expect(screen.getByText("Cargando citas...")).toBeInTheDocument();
  });

  // --- Caso de prueba 3: Estado de error ---
  it("should display an error message when error is present", () => {
    const errorMessage = "Error al cargar las citas.";
    render(<CitasTable {...defaultProps} error={errorMessage} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  // --- Caso de prueba 4: Tabla vacía ---
  it("should display a 'no appointments' message when no reservas are present", () => {
    render(<CitasTable {...defaultProps} reservas={[]} />);
    expect(screen.getByText("No hay citas registradas.")).toBeInTheDocument();
  });

  // --- Caso de prueba 5: Manejo de clics en botones de acción ---
  it("should handle action button clicks correctly", () => {
    render(<CitasTable {...defaultProps} />);

    // Encontrar la fila de la primera reserva (la segunda fila en la tabla)
    const firstReservationRow = screen.getAllByRole("row")[1];

    // Encontrar los botones dentro de esa fila
    const detailButton = firstReservationRow.querySelector(
      'button[aria-label="Detalles"]'
    );
    const notesButton = firstReservationRow.querySelector(
      'button[aria-label="Notas"]'
    );
    const confirmButton = firstReservationRow.querySelector(
      'button[aria-label="Confirmar"]'
    );
    const cancelButton = firstReservationRow.querySelector(
      'button[aria-label="Cancelar"]'
    );

    // Simular clic en el botón de "Detalles"
    fireEvent.click(detailButton);
    expect(mockSetSelectedReserva).toHaveBeenCalledWith(mockReservas[0]);
    expect(mockSetShowDetailsModal).toHaveBeenCalledWith(true);

    // Simular clic en el botón de "Notas"
    fireEvent.click(notesButton);
    expect(mockSetSelectedReserva).toHaveBeenCalledWith(mockReservas[0]);
    expect(mockSetShowNotesModal).toHaveBeenCalledWith(true);

    // Simular clic en el botón de "Confirmar"
    fireEvent.click(confirmButton);
    expect(mockSetReservaToUpdate).toHaveBeenCalledWith(mockReservas[0]);
    expect(mockSetNewStatusToApply).toHaveBeenCalledWith("confirmada");
    expect(mockSetShowConfirmModal).toHaveBeenCalledWith(true);

    // Simular clic en el botón de "Cancelar"
    fireEvent.click(cancelButton);
    expect(mockSetReservaToUpdate).toHaveBeenCalledWith(mockReservas[0]);
    expect(mockSetNewStatusToApply).toHaveBeenCalledWith("cancelada");
    expect(mockSetShowCancelModal).toHaveBeenCalledWith(true);
  });

  // --- Caso de prueba 6: Renderizado condicional de botones ---
  it("should render action buttons correctly for each reservation status", () => {
    render(<CitasTable {...defaultProps} />);

    // Para la cita pendiente (mockReservas[0]), hay 4 botones
    const firstRowButtons = screen
      .getAllByRole("row")[1]
      .querySelectorAll("button");
    expect(firstRowButtons).toHaveLength(4);

    // Para las citas confirmada, cancelada y completada (mockReservas[1, 2, 3]), hay 2 botones
    const otherRowsButtons = screen
      .getAllByRole("row")
      .slice(2)
      .map((row) => row.querySelectorAll("button"));
    otherRowsButtons.forEach((buttons) => {
      expect(buttons).toHaveLength(2);
    });
  });
});
