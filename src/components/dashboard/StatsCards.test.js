import { fireEvent, render, screen } from "@testing-library/react";
import StatsCards from "./StatsCards";

describe("StatsCards", () => {
  const mockStats = {
    citas_pendientes: 5,
    citas_semana: 12,
    total_pacientes: 150,
  };

  const mockSetWeekOffset = jest.fn();

  const defaultProps = {
    stats: mockStats,
    weekOffset: 0,
    setWeekOffset: mockSetWeekOffset,
  };

  // --- Caso de prueba 1: Renderizado de las tarjetas con los datos correctos ---
  it("should render the stats cards with correct data", () => {
    render(<StatsCards {...defaultProps} />);

    // Verificar que la tarjeta de "Citas pendientes" muestre el valor correcto
    expect(screen.getByText("Citas pendientes")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();

    // Verificar que la tarjeta de "Citas esta semana" muestre el valor correcto
    expect(screen.getByText("Citas esta semana")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();

    // Verificar que la tarjeta de "Total pacientes" muestre el valor correcto
    expect(screen.getByText("Total pacientes")).toBeInTheDocument();
    expect(screen.getByText("150")).toBeInTheDocument();
  });

  // --- Caso de prueba 2: Manejo de clics en los botones de semana ---
  it("should call setWeekOffset with a function that updates the state correctly when buttons are clicked", () => {
    render(<StatsCards {...defaultProps} />);

    // Simular clic en el botón para avanzar a la semana siguiente (▶)
    const nextWeekButton = document.querySelector("button:last-of-type");
    fireEvent.click(nextWeekButton);

    // Verificar que mockSetWeekOffset fue llamado con una función
    expect(mockSetWeekOffset).toHaveBeenCalledWith(expect.any(Function));

    // Ejecutar la función para verificar si actualiza el estado correctamente
    const updateFunctionNext = mockSetWeekOffset.mock.calls[0][0];
    expect(updateFunctionNext(defaultProps.weekOffset)).toBe(1);

    // Simular clic en el botón para retroceder a la semana anterior (◀)
    const prevWeekButton = document.querySelector("button:first-of-type");
    fireEvent.click(prevWeekButton);

    // Verificar que mockSetWeekOffset fue llamado de nuevo con una función
    expect(mockSetWeekOffset).toHaveBeenCalledWith(expect.any(Function));

    // Ejecutar la segunda función para verificar su lógica
    const updateFunctionPrev = mockSetWeekOffset.mock.calls[1][0];
    expect(updateFunctionPrev(defaultProps.weekOffset)).toBe(-1);
  });
});
