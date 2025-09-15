import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { act } from "react";
import CalendarioReservas from "./CalendarioReservas";

// Mock de react-big-calendar
jest.mock("react-big-calendar", () => {
  const MockCalendar = ({ events, onSelectSlot, onSelectEvent, ...props }) => {
    return (
      <div data-testid="calendar" {...props}>
        {events.map((event, index) => (
          <div
            key={index}
            data-testid={`event-${index}`}
            onClick={() => onSelectEvent(event)}
          >
            {event.title}
          </div>
        ))}
        <div
          data-testid="selectable-slot"
          onClick={() => {
            // Simulamos la selección de un slot VÁLIDO en el futuro
            const validStart = new Date(
              new Date().getTime() + 1000 * 60 * 60 * 2
            ); // 2 horas en el futuro
            onSelectSlot({ start: validStart });
          }}
        >
          Select Slot
        </div>
      </div>
    );
  };
  return {
    ...jest.requireActual("react-big-calendar"),
    Calendar: MockCalendar,
  };
});

describe("CalendarioReservas", () => {
  // Mocks de props y datos de prueba
  const mockDisponibilidad = {
    bloques: [
      {
        start: new Date(new Date().getTime() + 1000 * 60 * 60 * 1), // 1 hora en el futuro
        end: new Date(new Date().getTime() + 1000 * 60 * 60 * 5), // 5 horas en el futuro
      },
    ],
    citas: [],
  };
  const mockProcedimiento = {
    duracion_min: 60,
  };
  const mockSetFechaHoraSeleccionada = jest.fn();
  const mockSetPendingEvent = jest.fn();
  const mockShowMessage = jest.fn();

  it("should render correctly when loading is false and has availability", () => {
    render(
      <CalendarioReservas
        disponibilidad={mockDisponibilidad}
        procedimiento={mockProcedimiento}
        loading={false}
        setFechaHoraSeleccionada={mockSetFechaHoraSeleccionada}
        setPendingEvent={mockSetPendingEvent}
        pendingEvent={null}
        showMessage={mockShowMessage}
      />
    );

    expect(screen.getByTestId("calendar")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Elegir momento de reserva" })
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Cargando horarios disponibles...")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("No hay horarios disponibles para este doctor.")
    ).not.toBeInTheDocument();
  });

  it("should display a loading message when loading is true", () => {
    render(
      <CalendarioReservas
        disponibilidad={mockDisponibilidad}
        procedimiento={mockProcedimiento}
        loading={true}
        setFechaHoraSeleccionada={mockSetFechaHoraSeleccionada}
        setPendingEvent={mockSetPendingEvent}
        pendingEvent={null}
        showMessage={mockShowMessage}
      />
    );
    expect(
      screen.getByText("Cargando horarios disponibles...")
    ).toBeInTheDocument();
  });

  it("should display a message when there is no availability", () => {
    const noAvailability = { bloques: [], citas: [] };
    render(
      <CalendarioReservas
        disponibilidad={noAvailability}
        procedimiento={mockProcedimiento}
        loading={false}
        setFechaHoraSeleccionada={mockSetFechaHoraSeleccionada}
        setPendingEvent={mockSetPendingEvent}
        pendingEvent={null}
        showMessage={mockShowMessage}
      />
    );
    expect(
      screen.getByText("No hay horarios disponibles para este doctor.")
    ).toBeInTheDocument();
  });

  it("should show the modal when 'Elegir momento de reserva' button is clicked", () => {
    render(
      <CalendarioReservas
        disponibilidad={mockDisponibilidad}
        procedimiento={mockProcedimiento}
        loading={false}
        setFechaHoraSeleccionada={mockSetFechaHoraSeleccionada}
        setPendingEvent={mockSetPendingEvent}
        pendingEvent={null}
        showMessage={mockShowMessage}
      />
    );
    const showModalButton = screen.getByRole("button", {
      name: "Elegir momento de reserva",
    });
    fireEvent.click(showModalButton);
    expect(screen.getByText("Elegir Fecha y Hora")).toBeInTheDocument();
  });

  it("should call handleSelectSlot when selecting a valid time slot", async () => {
    await act(async () => {
      render(
        <CalendarioReservas
          disponibilidad={mockDisponibilidad}
          procedimiento={mockProcedimiento}
          loading={false}
          setFechaHoraSeleccionada={mockSetFechaHoraSeleccionada}
          setPendingEvent={mockSetPendingEvent}
          pendingEvent={null}
          showMessage={mockShowMessage}
        />
      );
    });

    const selectableSlot = screen.getByTestId("selectable-slot");
    fireEvent.click(selectableSlot);

    expect(mockSetFechaHoraSeleccionada).toHaveBeenCalled();
    expect(mockSetPendingEvent).toHaveBeenCalled();
    expect(mockShowMessage).toHaveBeenCalledWith(
      expect.stringContaining("Has seleccionado:"),
      "success",
      true
    );
  });
});
