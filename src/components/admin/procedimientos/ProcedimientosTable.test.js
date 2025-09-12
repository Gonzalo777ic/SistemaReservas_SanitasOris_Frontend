import { fireEvent, render, screen } from "@testing-library/react";
import ProcedimientosTable from "./ProcedimientosTable";

// Datos de prueba para simular una respuesta de la API
const mockProcedimientos = [
  {
    id: 1,
    imagen: "image-url-1.jpg",
    nombre: "Limpieza Dental",
    descripcion: "Eliminación de placa y sarro.",
    duracion_min: 30,
    doctores_nombres: ["Dr. Smith", "Dra. Johnson"],
    activo: true,
  },
  {
    id: 2,
    imagen: null,
    nombre: "Extracción Molar",
    descripcion: "Remoción de molar dañado.",
    duracion_min: 60,
    doctores_nombres: [],
    activo: false,
  },
];

describe("ProcedimientosTable", () => {
  // Configura las funciones mock para simular las props
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    // Limpia los mocks antes de cada prueba para evitar interferencias
    jest.clearAllMocks();
  });

  // --- Caso de prueba 1: Arreglo vacío ---
  it("should render a message when the procedimientos array is empty", () => {
    render(
      <ProcedimientosTable
        procedimientos={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    const noProceduresMessage = screen.getByText(
      /No hay procedimientos registrados./i
    );
    expect(noProceduresMessage).toBeInTheDocument();

    const tableRows = screen.queryAllByRole("row");
    expect(tableRows).toHaveLength(2); // Encabezado + fila de mensaje
  });

  // --- Caso de prueba 2: Arreglo con datos ---
  it("should render a table with data when a non-empty array is provided", () => {
    render(
      <ProcedimientosTable
        procedimientos={mockProcedimientos}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    const dataRows = screen.getAllByRole("row");
    expect(dataRows).toHaveLength(3); // Encabezado + 2 filas de datos
    expect(screen.getByText("Limpieza Dental")).toBeInTheDocument();
    expect(
      screen.getByText("Eliminación de placa y sarro.")
    ).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
    expect(screen.getByText("Dr. Smith, Dra. Johnson")).toBeInTheDocument();
    expect(screen.getByText("Sí")).toBeInTheDocument();
    expect(screen.getByText("Extracción Molar")).toBeInTheDocument();
    expect(screen.getByText("Remoción de molar dañado.")).toBeInTheDocument();
    expect(screen.getByText("60")).toBeInTheDocument();
    expect(screen.getByText("Ninguno")).toBeInTheDocument();
    expect(screen.getByText("No")).toBeInTheDocument();
  });

  // --- Caso de prueba 3: Interacción del usuario ---
  it("should call onEdit and onDelete with correct arguments when buttons are clicked", () => {
    render(
      <ProcedimientosTable
        procedimientos={mockProcedimientos}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    // 1. Encuentra los botones usando sus etiquetas de accesibilidad
    const editButton_1 = screen.getByRole("button", {
      name: "Editar Limpieza Dental",
    });
    const deleteButton_1 = screen.getByRole("button", {
      name: "Eliminar Limpieza Dental",
    });
    const editButton_2 = screen.getByRole("button", {
      name: "Editar Extracción Molar",
    });
    const deleteButton_2 = screen.getByRole("button", {
      name: "Eliminar Extracción Molar",
    });

    // 2. Simula un clic en los botones y verifica que las funciones mock sean llamadas
    fireEvent.click(editButton_1);
    expect(mockOnEdit).toHaveBeenCalledWith(mockProcedimientos[0]);

    fireEvent.click(deleteButton_1);
    expect(mockOnDelete).toHaveBeenCalledWith(1);

    fireEvent.click(editButton_2);
    expect(mockOnEdit).toHaveBeenCalledWith(mockProcedimientos[1]);

    fireEvent.click(deleteButton_2);
    expect(mockOnDelete).toHaveBeenCalledWith(2);
  });
});
