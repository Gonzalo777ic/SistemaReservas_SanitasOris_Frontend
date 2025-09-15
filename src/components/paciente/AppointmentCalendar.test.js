import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import AppointmentCalendar from "./AppointmentCalendar";

// Mock del componente de react-big-calendar y sus funciones relacionadas
// Esto es crucial para aislar nuestro test a la lógica del componente principal.
jest.mock("react-big-calendar", () => {
  const mockCalendar = jest.fn(() => <div>Mock Calendar</div>);
  const mockDateFnsLocalizer = jest.fn(() => ({}));
  return {
    Calendar: mockCalendar,
    dateFnsLocalizer: mockDateFnsLocalizer,
  };
});

// Importamos los mocks para poder hacer aserciones sobre ellos.
import { Calendar } from "react-big-calendar";

describe("AppointmentCalendar", () => {
  const mockAppointments = [
    {
      id: 1,
      title: "Consulta con Dr. López",
      start: new Date("2023-11-15T10:00:00Z"),
      end: new Date("2023-11-15T11:00:00Z"),
      estado: "confirmada",
    },
    {
      id: 2,
      title: "Revisión con Dra. García",
      start: new Date("2023-11-16T15:30:00Z"),
      end: new Date("2023-11-16T16:00:00Z"),
      estado: "pendiente",
    },
    {
      id: 3,
      title: "Vacunación",
      start: new Date("2023-11-17T09:00:00Z"),
      end: new Date("2023-11-17T09:30:00Z"),
      estado: "cancelada",
    },
  ];

  const mockHandleShowCancelModal = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    // Restablecemos los mocks antes de cada prueba.
    jest.clearAllMocks();
  });

  it("should render the Calendar component with the correct props", () => {
    render(
      <AppointmentCalendar
        appointments={mockAppointments}
        handleShowCancelModal={mockHandleShowCancelModal}
        navigate={mockNavigate}
      />
    );

    // Verificamos que el componente del calendario simulado fue llamado.
    expect(Calendar).toHaveBeenCalledTimes(1);

    // Obtenemos las props pasadas al componente Calendar.
    const calendarProps = Calendar.mock.calls[0][0];

    // Verificamos que las props clave se pasaron correctamente.
    expect(calendarProps.events).toEqual(mockAppointments);
    expect(calendarProps.localizer).toBeDefined();
    expect(calendarProps.startAccessor).toBe("start");
    expect(calendarProps.endAccessor).toBe("end");
    expect(calendarProps.style).toEqual({ height: 600 });
    expect(calendarProps.views).toEqual(["week", "month", "day"]);
    expect(calendarProps.defaultView).toBe("week");
  });

  it("should correctly style events based on their status", () => {
    render(
      <AppointmentCalendar
        appointments={mockAppointments}
        handleShowCancelModal={mockHandleShowCancelModal}
        navigate={mockNavigate}
      />
    );
    const calendarProps = Calendar.mock.calls[0][0];
    const eventPropGetter = calendarProps.eventPropGetter;

    // Testeamos cada estado de evento.
    const confirmadaStyle = eventPropGetter({ estado: "confirmada" });
    expect(confirmadaStyle.style.backgroundColor).toBe("rgb(0, 123, 255)");

    const pendienteStyle = eventPropGetter({ estado: "pendiente" });
    expect(pendienteStyle.style.backgroundColor).toBe("rgb(255, 193, 7)");

    const canceladaStyle = eventPropGetter({ estado: "cancelada" });
    expect(canceladaStyle.style.backgroundColor).toBe("rgb(220, 53, 69)");

    const unknownStyle = eventPropGetter({ estado: "unknown" });
    expect(unknownStyle.style.backgroundColor).toBe("gray");
  });

  it("should call handleShowCancelModal for 'pendiente' or 'confirmada' events", () => {
    render(
      <AppointmentCalendar
        appointments={mockAppointments}
        handleShowCancelModal={mockHandleShowCancelModal}
        navigate={mockNavigate}
      />
    );

    const calendarProps = Calendar.mock.calls[0][0];
    const onSelectEvent = calendarProps.onSelectEvent;

    // Simula la selección de un evento confirmado.
    onSelectEvent(mockAppointments[0]);
    expect(mockHandleShowCancelModal).toHaveBeenCalledWith(mockAppointments[0]);

    // Simula la selección de un evento pendiente.
    onSelectEvent(mockAppointments[1]);
    expect(mockHandleShowCancelModal).toHaveBeenCalledWith(mockAppointments[1]);
  });

  it("should NOT call handleShowCancelModal for 'cancelada' events", () => {
    render(
      <AppointmentCalendar
        appointments={mockAppointments}
        handleShowCancelModal={mockHandleShowCancelModal}
        navigate={mockNavigate}
      />
    );

    const calendarProps = Calendar.mock.calls[0][0];
    const onSelectEvent = calendarProps.onSelectEvent;

    // Simula la selección de un evento cancelado.
    onSelectEvent(mockAppointments[2]);
    expect(mockHandleShowCancelModal).not.toHaveBeenCalled();
  });

  it("should call navigate when 'Reservar nueva cita' button is clicked", () => {
    render(
      <AppointmentCalendar
        appointments={mockAppointments}
        handleShowCancelModal={mockHandleShowCancelModal}
        navigate={mockNavigate}
      />
    );

    const button = screen.getByText("Reservar nueva cita");
    fireEvent.click(button);

    // Verificamos que la función de navegación fue llamada con la ruta correcta.
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/reservar");
  });
});
