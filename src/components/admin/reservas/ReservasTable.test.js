import { fireEvent, render, screen, within } from "@testing-library/react";
import ReservasTable from "./ReservasTable";

// Mock de una lista de reservas para las pruebas
const mockReservas = [
  {
    id: 1,
    paciente: {
      user: {
        first_name: "Juan",
        last_name: "Pérez",
        email: "juan@example.com",
      },
    },
    doctor: {
      user: {
        first_name: "Dr.",
        last_name: "Smith",
        email: "smith@example.com",
      },
    },
    procedimiento_nombre: "Limpieza dental",
    fecha_hora: "2025-10-22T10:00:00Z",
    estado: "pendiente",
  },
  {
    id: 2,
    paciente: {
      user: {
        first_name: "Ana",
        last_name: "García",
        email: "ana@example.com",
      },
    },
    doctor: {
      user: {
        first_name: "Dra.",
        last_name: "Johnson",
        email: "johnson@example.com",
      },
    },
    procedimiento_nombre: "Revisión general",
    fecha_hora: "2025-10-23T15:30:00Z",
    estado: "confirmada",
  },
  {
    id: 3,
    paciente: {
      user: {
        first_name: "Carlos",
        last_name: "López",
        email: "carlos@example.com",
      },
    },
    doctor: {
      user: {
        first_name: "Dr.",
        last_name: "Smith",
        email: "smith@example.com",
      },
    },
    procedimiento_nombre: "Extracción",
    fecha_hora: "2025-10-24T09:00:00Z",
    estado: "cancelada",
  },
];

describe("ReservasTable", () => {
  // Mock de la función `onUpdateStatus` para verificar si es llamada
  const mockOnUpdateStatus = jest.fn();

  // Caso de prueba 1: Renderiza la tabla cuando el array de reservas está vacío
  it("should render a message when the reservations array is empty", () => {
    render(<ReservasTable reservas={[]} onUpdateStatus={mockOnUpdateStatus} />);
    const noReservationsMessage = screen.getByText(
      "No se encontraron reservas con el filtro actual."
    );
    expect(noReservationsMessage).toBeInTheDocument();
  });

  // Caso de prueba 2: Renderiza la tabla con datos
  it("should render the table rows with the correct reservation data", () => {
    render(
      <ReservasTable
        reservas={mockReservas}
        onUpdateStatus={mockOnUpdateStatus}
      />
    );

    // 1. Verifica que las filas de la tabla se rendericen con los nombres de los pacientes
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("Ana García")).toBeInTheDocument();
    expect(screen.getByText("Carlos López")).toBeInTheDocument();

    // 2. Verifica que las insignias de estado se rendericen con el texto correcto
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
    expect(screen.getByText("Confirmada")).toBeInTheDocument();
    expect(screen.getByText("Cancelada")).toBeInTheDocument();
  });

  // Caso de prueba 3: Los botones de acción se muestran condicionalmente
  it("should display action buttons based on reservation status", () => {
    render(
      <ReservasTable
        reservas={mockReservas}
        onUpdateStatus={mockOnUpdateStatus}
      />
    );

    // 1. Para la reserva "pendiente" (id: 1)
    const pendienteRow = screen.getByText("Juan Pérez").closest("tr");
    const approveButton = within(pendienteRow).getByTitle("Aprobar");
    const cancelButton = within(pendienteRow).getByTitle("Cancelar");
    expect(approveButton).toBeInTheDocument();
    expect(cancelButton).toBeInTheDocument();

    // 2. Para la reserva "confirmada" (id: 2)
    const confirmadaRow = screen.getByText("Ana García").closest("tr");
    // Usamos queryByTitle para verificar que el botón "Aprobar" no existe en esta fila
    const approveButtonInConfirmedRow =
      within(confirmadaRow).queryByTitle("Aprobar");
    // Verificamos que el botón "Cancelar" sí existe
    const cancelButtonInConfirmedRow =
      within(confirmadaRow).getByTitle("Cancelar");
    expect(approveButtonInConfirmedRow).not.toBeInTheDocument();
    expect(cancelButtonInConfirmedRow).toBeInTheDocument();

    // 3. Para la reserva "cancelada" (id: 3)
    const canceladaRow = screen.getByText("Carlos López").closest("tr");
    expect(within(canceladaRow).queryByRole("button")).not.toBeInTheDocument();
  });

  // Caso de prueba 4: Al hacer clic en un botón, se llama a `onUpdateStatus`
  it("should call onUpdateStatus with correct arguments when action buttons are clicked", () => {
    render(
      <ReservasTable
        reservas={mockReservas}
        onUpdateStatus={mockOnUpdateStatus}
      />
    );

    // Obtenemos las filas para usarlas con `within`
    const pendienteRow = screen.getByText("Juan Pérez").closest("tr");
    const confirmadaRow = screen.getByText("Ana García").closest("tr");

    // 1. Simula clic en el botón "Aprobar" para la reserva pendiente
    const approveButton = within(pendienteRow).getByTitle("Aprobar");
    fireEvent.click(approveButton);
    expect(mockOnUpdateStatus).toHaveBeenCalledWith(1, "confirmada");
    expect(mockOnUpdateStatus).toHaveBeenCalledTimes(1);

    // 2. Simula clic en el botón "Cancelar" para la reserva pendiente
    const cancelButtonPendiente = within(pendienteRow).getByTitle("Cancelar");
    fireEvent.click(cancelButtonPendiente);
    expect(mockOnUpdateStatus).toHaveBeenCalledWith(1, "cancelada");
    expect(mockOnUpdateStatus).toHaveBeenCalledTimes(2);

    // 3. Simula clic en el botón "Cancelar" para la reserva confirmada
    const cancelButtonConfirmada = within(confirmadaRow).getByTitle("Cancelar");
    fireEvent.click(cancelButtonConfirmada);
    expect(mockOnUpdateStatus).toHaveBeenCalledWith(2, "cancelada");
    expect(mockOnUpdateStatus).toHaveBeenCalledTimes(3);
  });
});
