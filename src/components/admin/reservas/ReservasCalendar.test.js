import { render, screen } from "@testing-library/react";
import { Views } from "react-big-calendar";
import ReservasCalendar from "./ReservasCalendar";

// Mock de los eventos para las pruebas
const mockEvents = [
  {
    title: "Cita Provisional",
    start: new Date(2025, 9, 22, 10, 0, 0),
    end: new Date(2025, 9, 22, 10, 30, 0),
    isProvisional: true,
  },
  {
    title: "Cita Confirmada",
    start: new Date(2025, 9, 24, 14, 0, 0),
    end: new Date(2025, 9, 24, 15, 0, 0),
    isProvisional: false,
  },
];

// Mock de las funciones de manejo
const mockOnView = jest.fn();
const mockOnNavigate = jest.fn();
const mockOnEventDrop = jest.fn();

// Guardamos la implementación original para restaurarla después
const originalElementFromPoint = document.elementFromPoint;

describe("ReservasCalendar", () => {
  beforeAll(() => {
    // Congelamos el tiempo para pruebas consistentes
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2025, 9, 20)); // Oct 20, 2025, es un lunes

    // MOCK: Creamos un mock para document.elementFromPoint para evitar el error de JSDOM.
    document.elementFromPoint = jest.fn(() => {
      // Devolvemos un elemento simple, como un div, para simular un "drop target"
      return document.createElement("div");
    });
  });

  afterAll(() => {
    // Restauramos el tiempo y la función original después de todas las pruebas
    jest.useRealTimers();
    document.elementFromPoint = originalElementFromPoint;
  });

  // --- Caso de prueba: Renderiza con eventos y estilos correctos ---
  it("should render the calendar with provisional and confirmed events and correct styles", () => {
    render(
      <ReservasCalendar
        events={mockEvents}
        view={Views.WEEK}
        onView={mockOnView}
        date={new Date()}
        onNavigate={mockOnNavigate}
        onEventDrop={mockOnEventDrop}
      />
    );

    // 1. Verifica que los eventos se muestren en el calendario
    const provisionalEvent = screen.getByText("Cita Provisional");
    const confirmedEvent = screen.getByText("Cita Confirmada");
    expect(provisionalEvent).toBeInTheDocument();
    expect(confirmedEvent).toBeInTheDocument();

    // 2. Verifica que los eventos provisionales tengan el color de fondo correcto
    expect(provisionalEvent.closest(".rbc-event")).toHaveStyle(
      "background-color: rgb(255, 193, 7)"
    );

    // 3. Verifica que los eventos confirmados tengan el color de fondo correcto
    expect(confirmedEvent.closest(".rbc-event")).toHaveStyle(
      "background-color: rgb(40, 167, 69)"
    );
  });
});
