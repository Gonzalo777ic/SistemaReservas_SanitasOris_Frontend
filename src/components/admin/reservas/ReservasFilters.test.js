import { fireEvent, render, screen } from "@testing-library/react";
import ReservasFilters from "./ReservasFilters";

describe("ReservasFilters", () => {
  // Mock de la función `setFilter` para poder verificar si fue llamada
  const mockSetFilter = jest.fn();

  // Caso de prueba 1: Renderiza el componente con el filtro inicial
  it("should render the dropdown button with the initial filter value", () => {
    const initialFilter = "pendiente";
    render(
      <ReservasFilters filter={initialFilter} setFilter={mockSetFilter} />
    );

    // Verifica que el botón muestre el texto "Filtrar por: Pendiente"
    const dropdownButton = screen.getByRole("button", {
      name: "Filtrar por: Pendiente",
    });
    expect(dropdownButton).toBeInTheDocument();
  });

  // Caso de prueba 2: Al hacer clic en una opción, se debe llamar a setFilter
  it("should call setFilter with the correct value when a dropdown item is clicked", () => {
    const initialFilter = "confirmada";
    render(
      <ReservasFilters filter={initialFilter} setFilter={mockSetFilter} />
    );

    // 1. Simula el clic en el botón para abrir el dropdown
    const dropdownButton = screen.getByRole("button", {
      name: "Filtrar por: Confirmada",
    });
    fireEvent.click(dropdownButton);

    // 2. Simula el clic en la opción "Pendiente"
    const pendienteItem = screen.getByRole("button", { name: "Pendiente" });
    fireEvent.click(pendienteItem);

    // 3. Verifica que `setFilter` se haya llamado con el valor correcto
    expect(mockSetFilter).toHaveBeenCalledTimes(1);
    expect(mockSetFilter).toHaveBeenCalledWith("pendiente");

    // 4. Simula el clic en la opción "Cancelada"
    const canceladaItem = screen.getByRole("button", { name: "Cancelada" });
    fireEvent.click(canceladaItem);

    // 5. Verifica que `setFilter` se haya llamado de nuevo con el valor correcto
    expect(mockSetFilter).toHaveBeenCalledTimes(2);
    expect(mockSetFilter).toHaveBeenCalledWith("cancelada");
  });
});
