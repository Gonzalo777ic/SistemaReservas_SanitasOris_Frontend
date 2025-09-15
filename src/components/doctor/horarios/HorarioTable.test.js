import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import HorarioTable from "./HorarioTable";

// Mock the DIAS_SEMANA_MAP constant since it's used within the component
jest.mock("../../../pages/HorarioDoctorPage", () => ({
  DIAS_SEMANA_MAP: [
    { value: 0, label: "Lunes" },
    { value: 1, label: "Martes" },
    { value: 2, label: "Miércoles" },
    { value: 3, label: "Jueves" },
    { value: 4, label: "Viernes" },
    { value: 5, label: "Sábado" },
    { value: 6, label: "Domingo" },
  ],
}));

describe("HorarioTable", () => {
  const mockHorarios = [
    {
      id: "1",
      dia_semana: 1,
      hora_inicio: "09:00",
      hora_fin: "17:00",
      activo: true,
    },
    {
      id: "2",
      dia_semana: 3,
      hora_inicio: "10:00",
      hora_fin: "14:00",
      activo: false,
    },
  ];

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnToggleActive = jest.fn();

  it("should render the table with the correct data", () => {
    render(
      <HorarioTable
        horarios={mockHorarios}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    );

    // Assert that the table headers are present
    expect(screen.getByText("Día")).toBeInTheDocument();
    expect(screen.getByText("Hora Inicio")).toBeInTheDocument();
    expect(screen.getByText("Hora Fin")).toBeInTheDocument();
    expect(screen.getByText("Estado")).toBeInTheDocument();
    expect(screen.getByText("Acciones")).toBeInTheDocument();

    // Assert that the data for each schedule is correctly rendered
    expect(screen.getByText("Martes")).toBeInTheDocument();
    expect(screen.getByText("09:00")).toBeInTheDocument();
    expect(screen.getByText("17:00")).toBeInTheDocument();
    expect(screen.getByText("Jueves")).toBeInTheDocument();
    expect(screen.getByText("10:00")).toBeInTheDocument();
    expect(screen.getByText("14:00")).toBeInTheDocument();
  });

  it("should render 'Activo' and 'Inactivo' badges correctly", () => {
    render(
      <HorarioTable
        horarios={mockHorarios}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    );

    // The first schedule is 'activo' and should have the "Ocultar" button
    expect(screen.getByRole("button", { name: "Ocultar" })).toBeInTheDocument();

    // The second schedule is 'inactivo' and should have the "Mostrar" button
    expect(screen.getByRole("button", { name: "Mostrar" })).toBeInTheDocument();
  });

  it("should call onEdit with the correct horario when the edit button is clicked", () => {
    render(
      <HorarioTable
        horarios={mockHorarios}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    );
    // Find the edit button for the first schedule by its ARIA label
    const editButton = screen.getAllByRole("button", {
      name: "Editar horario",
    })[0];
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(mockHorarios[0]);
  });

  it("should call onDelete with the correct horario when the delete button is clicked", () => {
    render(
      <HorarioTable
        horarios={mockHorarios}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    );
    // Find the delete button for the first schedule by its ARIA label
    const deleteButton = screen.getAllByRole("button", {
      name: "Eliminar horario",
    })[0];
    fireEvent.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(mockHorarios[0]);
  });

  it("should call onToggleActive with the correct horario when the toggle button is clicked", () => {
    render(
      <HorarioTable
        horarios={mockHorarios}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    );
    // Find the "Ocultar" button for the first active schedule
    const toggleButton = screen.getByRole("button", { name: "Ocultar" });
    fireEvent.click(toggleButton);

    expect(mockOnToggleActive).toHaveBeenCalledTimes(1);
    expect(mockOnToggleActive).toHaveBeenCalledWith(mockHorarios[0]);
  });

  it("should display a message when there are no schedules", () => {
    render(
      <HorarioTable
        horarios={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleActive={mockOnToggleActive}
      />
    );

    expect(
      screen.getByText("No hay horarios registrados.")
    ).toBeInTheDocument();
  });
});
