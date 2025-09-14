import { render, screen } from "@testing-library/react";
import AdminCalendar from "./AdminCalendar";

// Mock de los eventos para las pruebas
const mockAppointments = [
  {
    title: "Consulta con Dr. Smith",
    start: new Date(2025, 9, 22, 10, 0, 0), // Oct 22, 2025, 10:00 AM
    end: new Date(2025, 9, 22, 10, 30, 0), // Oct 22, 2025, 10:30 AM
  },
  {
    title: "Tratamiento con Dra. Johnson",
    start: new Date(2025, 9, 24, 14, 0, 0), // Oct 24, 2025, 2:00 PM
    end: new Date(2025, 9, 24, 15, 0, 0), // Oct 24, 2025, 3:00 PM
  },
];

describe("AdminCalendar", () => {
  // Configura el entorno de la prueba para una fecha conocida para asegurar la consistencia.
  beforeAll(() => {
    // Establecer una fecha para que las pruebas de día de la semana sean consistentes
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2025, 9, 20)); // Oct 20, 2025, es un lunes
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  // --- Caso de prueba 1: Renderiza un calendario vacío ---
  it("should render the calendar with no events when the appointments array is empty", () => {
    // 1. Renderiza el componente con un arreglo de citas vacío
    render(<AdminCalendar appointments={[]} />);

    // 2. Verifica que los nombres de los días de la semana estén presentes.
    // Usamos expresiones regulares para ser más flexibles y encontrar abreviaturas
    // y los números de los días.
    expect(screen.getByText(/Mon/i)).toBeInTheDocument();
    expect(screen.getByText(/Tue/i)).toBeInTheDocument();
    expect(screen.getByText(/Wed/i)).toBeInTheDocument();
    expect(screen.getByText(/Thu/i)).toBeInTheDocument();
    expect(screen.getByText(/Fri/i)).toBeInTheDocument();
    expect(screen.getByText(/Sat/i)).toBeInTheDocument();
    expect(screen.getByText(/Sun/i)).toBeInTheDocument();

    // 3. Verifica que no se rendericen eventos
    expect(
      screen.queryByText("Consulta con Dr. Smith")
    ).not.toBeInTheDocument();
  });

  // --- Caso de prueba 2: Renderiza con eventos ---
  it("should render the calendar with the provided appointments", () => {
    // 1. Renderiza el componente con las citas mock
    render(<AdminCalendar appointments={mockAppointments} />);

    // 2. Verifica que los eventos se muestren en el calendario
    const event1 = screen.getByText("Consulta con Dr. Smith");
    const event2 = screen.getByText("Tratamiento con Dra. Johnson");
    expect(event1).toBeInTheDocument();
    expect(event2).toBeInTheDocument();
  });

  // --- Caso de prueba 3: Vista y localización ---
  it("should display the correct views", () => {
    render(<AdminCalendar appointments={[]} />);

    // 1. Verifica que los botones de vista estén presentes en inglés,
    // usando la opción "exact: true" para que la búsqueda sea más precisa y evite el conflicto con "Today".
    expect(
      screen.getByRole("button", { name: "Week", exact: true })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Day", exact: true })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Month", exact: true })
    ).not.toBeInTheDocument();
  });
});
