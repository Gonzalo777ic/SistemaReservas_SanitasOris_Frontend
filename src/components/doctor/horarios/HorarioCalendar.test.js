import { fireEvent, render, screen } from "@testing-library/react";
import "jest-date-mock";
import HorarioCalendar from "./HorarioCalendar";

// Nuevo Mock mejorado de la librería react-big-calendar
jest.mock("react-big-calendar", () => {
  const MockCalendar = ({ events, onSelectSlot, onSelectEvent, ...props }) => (
    <div data-testid="calendar" {...props}>
      {/* Mock de un evento del calendario */}
      {events.map((event) => (
        <div
          key={event.resourceId}
          data-testid={`event-${event.resourceId}`}
          onClick={() => onSelectEvent(event)}
        >
          {event.title}
        </div>
      ))}
      {/* Mock de un slot seleccionable */}
      <div
        data-testid="slot"
        onClick={() => onSelectSlot({ start: new Date(), end: new Date() })}
      >
        Select Slot
      </div>
    </div>
  );

  const localizer = {
    format: jest.fn(),
    parse: jest.fn(),
    startOfWeek: jest.fn(),
    getDay: jest.fn(),
    locales: {},
  };

  return {
    __esModule: true,
    default: MockCalendar,
    Calendar: MockCalendar,
    dateFnsLocalizer: jest.fn(() => localizer),
  };
});

// Mock de la biblioteca de iconos para evitar errores de renderizado
jest.mock("react-icons/md", () => ({
  MdAddCircle: () => <svg data-testid="add-icon" />,
}));

describe("HorarioCalendar", () => {
  const mockHorarios = [
    {
      id: "1",
      dia_semana: 1, // Lunes
      hora_inicio: "09:00",
      hora_fin: "10:00",
      activo: true,
    },
    {
      id: "2",
      dia_semana: 2, // Martes
      hora_inicio: "11:00",
      hora_fin: "12:00",
      activo: false, // Inactivo, no debe aparecer
    },
    {
      id: "3",
      dia_semana: 3, // Miércoles
      hora_inicio: "14:00",
      hora_fin: "15:00",
      activo: true,
    },
  ];

  const mockProps = {
    horarios: mockHorarios,
    onSelectSlot: jest.fn(),
    onSelectEvent: jest.fn(),
    onAddHorarioClick: jest.fn(),
  };

  beforeAll(() => {
    // Congelar la fecha para que los tests sean consistentes
    const fixedDate = new Date(2025, 8, 15); // Lunes, 15 de septiembre de 2025
    jest.useFakeTimers("modern").setSystemTime(fixedDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  // --- Caso de prueba 1: Renderizado del botón y el título ---
  it("should render the title and the 'Añadir Horario' button", () => {
    render(<HorarioCalendar {...mockProps} />);
    expect(screen.getByText("Vista Semanal")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /añadir horario/i })
    ).toBeInTheDocument();
  });

  // --- Caso de prueba 2: Renderizado de solo horarios activos como eventos ---
  it("should render only active schedules as calendar events", () => {
    render(<HorarioCalendar {...mockProps} />);
    expect(screen.getByText("09:00 - 10:00")).toBeInTheDocument();
    expect(screen.getByText("14:00 - 15:00")).toBeInTheDocument();
    // No debe renderizar el horario inactivo
    expect(screen.queryByText("11:00 - 12:00")).not.toBeInTheDocument();
  });

  // --- Caso de prueba 3: Manejo del clic en el botón "Añadir Horario" ---
  it("should call onAddHorarioClick when the 'Añadir Horario' button is clicked", () => {
    render(<HorarioCalendar {...mockProps} />);
    const addButton = screen.getByRole("button", { name: /añadir horario/i });
    fireEvent.click(addButton);
    expect(mockProps.onAddHorarioClick).toHaveBeenCalledTimes(1);
  });

  // --- Caso de prueba 4: Manejo de la selección de un slot ---
  it("should call onSelectSlot when a calendar slot is selected", () => {
    render(<HorarioCalendar {...mockProps} />);
    const slot = screen.getByTestId("slot");
    fireEvent.click(slot);
    expect(mockProps.onSelectSlot).toHaveBeenCalledTimes(1);
  });

  // --- Caso de prueba 5: Manejo de la selección de un evento ---
  it("should call onSelectEvent when a calendar event is clicked", async () => {
    render(<HorarioCalendar {...mockProps} />);
    const event = screen.getByTestId("event-1");
    fireEvent.click(event);
    expect(mockProps.onSelectEvent).toHaveBeenCalledTimes(1);
    expect(mockProps.onSelectEvent).toHaveBeenCalledWith(
      expect.objectContaining({ resourceId: "1" })
    );
  });
});
