import { render, screen } from "@testing-library/react";
import LoadingSpinner from "./LoadingSpinner";

describe("LoadingSpinner", () => {
  // --- Caso de prueba 1: Renderizado básico con el mensaje por defecto ---
  it("should render with the default loading message", () => {
    render(<LoadingSpinner />);

    // Verificar que el spinner esté presente buscando su rol
    expect(screen.getByRole("status")).toBeInTheDocument();

    // Verificar que el mensaje por defecto sea visible
    expect(screen.getByText("Cargando...")).toBeInTheDocument();
  });

  // --- Caso de prueba 2: Renderizado con un mensaje personalizado ---
  it("should render with a custom message", () => {
    const customMessage = "Cargando datos del servidor...";
    render(<LoadingSpinner message={customMessage} />);

    // Verificar que el spinner esté presente
    expect(screen.getByRole("status")).toBeInTheDocument();

    // Verificar que el mensaje personalizado sea visible
    expect(screen.getByText(customMessage)).toBeInTheDocument();
  });

  // --- Caso de prueba 3: El mensaje está asociado al spinner ---
  it("should have the custom message visible to accessibility tools", () => {
    const customMessage = "Cargando, por favor espere...";
    render(<LoadingSpinner message={customMessage} />);

    // El "visually-hidden" es para que el mensaje no se vea, pero sea leíble por lectores de pantalla
    const spinner = screen.getByRole("status");
    expect(spinner).toHaveTextContent(customMessage);
  });
});
