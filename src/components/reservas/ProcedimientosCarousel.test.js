import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import ProcedimientosCarousel from "./ProcedimientosCarousel";

// Mock de react-bootstrap.Carousel para simplificar las pruebas
jest.mock("react-bootstrap/Carousel", () => {
  const MockCarousel = ({ children, activeIndex, onSelect }) => (
    <div data-testid="mock-carousel">
      {children.map((child, index) => (
        <div
          key={index}
          data-testid={`carousel-item-${index}`}
          style={{ display: index === activeIndex ? "block" : "none" }}
        >
          {child}
        </div>
      ))}
      <button
        data-testid="next-button"
        onClick={() => onSelect(activeIndex + 1)}
      >
        Next
      </button>
      <button
        data-testid="prev-button"
        onClick={() => onSelect(activeIndex - 1)}
      >
        Prev
      </button>
    </div>
  );
  MockCarousel.Item = ({ children }) => <div>{children}</div>;
  return MockCarousel;
});

// Datos de prueba para simular una lista de procedimientos
const mockProcedimientos = [
  {
    id: 1,
    nombre: "Limpieza Dental",
    descripcion: "Remoción de placa y sarro.",
    duracion_min: 30,
    activo: true,
    imagen: "https://via.placeholder.com/200?text=Limpieza+Dental",
  },
  {
    id: 2,
    nombre: "Extracción de Muela",
    descripcion: "Procedimiento quirúrgico para remover un diente.",
    duracion_min: 60,
    activo: true,
    imagen: "https://via.placeholder.com/200?text=Extraccion+Muela",
  },
];

describe("ProcedimientosCarousel", () => {
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Prueba de renderizado con lista vacía ---
  it("should render a message when the procedures list is empty", () => {
    render(
      <ProcedimientosCarousel procedimientos={[]} onSelect={mockOnSelect} />
    );
    expect(
      screen.getByText("No hay procedimientos disponibles.")
    ).toBeInTheDocument();
  });

  // --- Prueba de renderizado de procedimientos ---
  it("should render procedure details correctly for each item", () => {
    render(
      <ProcedimientosCarousel
        procedimientos={mockProcedimientos}
        onSelect={mockOnSelect}
      />
    );

    // El primer item debería estar visible por defecto (activeIndex = 0)
    expect(screen.getByText("Limpieza Dental")).toBeVisible();
    expect(screen.getByText("Remoción de placa y sarro.")).toBeVisible();
    expect(screen.getByText("30 min")).toBeVisible();

    // El segundo item no debería estar visible al inicio
    expect(screen.queryByText("Extracción de Muela")).not.toBeVisible();
  });

  // --- Prueba de funcionalidad de selección ---
  it("should call onSelect with the correct procedure when a button is clicked", () => {
    render(
      <ProcedimientosCarousel
        procedimientos={mockProcedimientos}
        onSelect={mockOnSelect}
      />
    );

    // Selecciona el primer item
    const firstItemButton = screen.getByRole("button", {
      name: "Seleccionado",
    });
    expect(firstItemButton).toBeInTheDocument();

    // Simula hacer clic en el botón del segundo item
    fireEvent.click(screen.getByTestId("next-button"));

    // Verifica que el onSelect haya sido llamado con el segundo procedimiento
    expect(mockOnSelect).toHaveBeenCalledWith(mockProcedimientos[1]);
  });
});
