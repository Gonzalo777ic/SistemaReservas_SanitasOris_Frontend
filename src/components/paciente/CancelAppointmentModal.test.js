import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import CancelAppointmentModal from "./CancelAppointmentModal";

describe("CancelAppointmentModal", () => {
  const mockAppointment = {
    id: 1,
    start: new Date("2023-11-15T10:00:00Z"),
  };
  const mockOnHide = jest.fn();
  const mockHandleCancelAppointment = jest.fn();

  const expectedDate = format(mockAppointment.start, "dd MMM yyyy", {
    locale: es,
  });
  const expectedTime = format(mockAppointment.start, "HH:mm", { locale: es });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render the modal when 'show' is true and display appointment details", () => {
    render(
      <CancelAppointmentModal
        show={true}
        onHide={mockOnHide}
        appointmentToCancel={mockAppointment}
        handleCancelAppointment={mockHandleCancelAppointment}
      />
    );

    // Verificamos que el título del modal y el botón existan.
    const cancelTextElements = screen.getAllByText("Cancelar Cita");
    const modalTitle = cancelTextElements.find(
      (el) => el.tagName.toLowerCase() === "div"
    );
    expect(modalTitle).toBeInTheDocument();
    expect(
      screen.getByText("Esta acción no se puede deshacer.")
    ).toBeInTheDocument();

    // Encontramos el elemento <p> principal por una parte de su texto.
    const appointmentParagraph = screen.getByText(
      /¿Estás seguro de que deseas cancelar la cita del/
    );

    // Verificamos que el texto completo, incluyendo las partes dinámicas, esté presente en el elemento padre.
    const expectedFullText = `¿Estás seguro de que deseas cancelar la cita del ${expectedDate} a las ${expectedTime}?`;
    expect(appointmentParagraph.textContent).toContain(expectedFullText);

    // Verificamos que los botones estén presentes.
    expect(screen.getByText("Cerrar")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Cancelar Cita" })
    ).toBeInTheDocument();
  });

  it("should not render the modal when 'show' is false", () => {
    render(
      <CancelAppointmentModal
        show={false}
        onHide={mockOnHide}
        appointmentToCancel={mockAppointment}
        handleCancelAppointment={mockHandleCancelAppointment}
      />
    );

    expect(screen.queryByText("Cancelar Cita")).not.toBeInTheDocument();
  });

  it("should call 'onHide' when the 'Cerrar' button is clicked", () => {
    render(
      <CancelAppointmentModal
        show={true}
        onHide={mockOnHide}
        appointmentToCancel={mockAppointment}
        handleCancelAppointment={mockHandleCancelAppointment}
      />
    );

    const closeButton = screen.getByText("Cerrar");
    fireEvent.click(closeButton);

    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });

  it("should call 'handleCancelAppointment' when the 'Cancelar Cita' button is clicked", () => {
    render(
      <CancelAppointmentModal
        show={true}
        onHide={mockOnHide}
        appointmentToCancel={mockAppointment}
        handleCancelAppointment={mockHandleCancelAppointment}
      />
    );

    const cancelButton = screen.getByRole("button", { name: "Cancelar Cita" });
    fireEvent.click(cancelButton);

    expect(mockHandleCancelAppointment).toHaveBeenCalledTimes(1);
  });
});
