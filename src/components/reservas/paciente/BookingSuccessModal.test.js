import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import BookingSuccessModal from "./BookingSuccessModal";

describe("BookingSuccessModal", () => {
  const mockOnHide = jest.fn();

  beforeEach(() => {
    // Limpiamos el mock antes de cada prueba
    jest.clearAllMocks();
  });

  it("should not render the modal when 'show' prop is false", () => {
    // Renderizamos con la prop 'show' en falso
    render(<BookingSuccessModal show={false} onHide={mockOnHide} />);

    // Verificamos que el título del modal NO esté en el documento
    expect(screen.queryByText("Cita Solicitada")).not.toBeInTheDocument();
  });

  it("should render the modal content correctly when 'show' is true", () => {
    // Renderizamos con la prop 'show' en verdadero
    render(<BookingSuccessModal show={true} onHide={mockOnHide} />);

    // Verificamos que el título y los mensajes del modal estén presentes
    expect(screen.getByText("Cita Solicitada")).toBeInTheDocument();
    expect(
      screen.getByText("¡Tu cita se ha solicitado con éxito!")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Te redirigiremos a tu dashboard.")
    ).toBeInTheDocument();

    // Verificamos que el botón "OK" esté presente
    const okButton = screen.getByRole("button", { name: "OK" });
    expect(okButton).toBeInTheDocument();
  });

  it("should call 'onHide' when the 'OK' button is clicked", () => {
    // Renderizamos el modal visible
    render(<BookingSuccessModal show={true} onHide={mockOnHide} />);

    // Hacemos clic en el botón "OK"
    const okButton = screen.getByRole("button", { name: "OK" });
    fireEvent.click(okButton);

    // Verificamos que la función onHide haya sido llamada una vez
    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });

  it("should call 'onHide' when the close button is clicked", () => {
    // Renderizamos el modal visible
    render(<BookingSuccessModal show={true} onHide={mockOnHide} />);

    // Hacemos clic en el botón de cerrar del modal
    const closeButton = screen.getByRole("button", { name: "Close" });
    fireEvent.click(closeButton);

    // Verificamos que la función onHide haya sido llamada una vez
    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });
});
