import { fireEvent, render, screen } from "@testing-library/react";
import HorarioConfirmationModals from "./HorarioConfirmationModals";

describe("HorarioConfirmationModals", () => {
  const mockProps = {
    showSaveTemplateModal: false,
    setShowSaveTemplateModal: jest.fn(),
    templateName: "",
    setTemplateName: jest.fn(),
    handleSaveTemplate: jest.fn(),
    showDeleteModal: false,
    setShowDeleteModal: jest.fn(),
    handleConfirmDeleteHorario: jest.fn(),
  };

  // --- Caso de prueba 1: Modal de guardar plantilla (Save Template) ---
  it("should show the save template modal when showSaveTemplateModal is true", () => {
    render(
      <HorarioConfirmationModals {...mockProps} showSaveTemplateModal={true} />
    );
    expect(
      screen.getByText("Guardar Horario como Plantilla")
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Guardar" })).toBeInTheDocument();
  });

  it("should call setTemplateName when the input value changes", () => {
    render(
      <HorarioConfirmationModals {...mockProps} showSaveTemplateModal={true} />
    );
    const input = screen.getByPlaceholderText("Ej. Horario de Verano");
    fireEvent.change(input, { target: { value: "Horario de Invierno" } });
    expect(mockProps.setTemplateName).toHaveBeenCalledWith(
      "Horario de Invierno"
    );
  });

  it("should call handleSaveTemplate when the 'Guardar' button is clicked", () => {
    render(
      <HorarioConfirmationModals {...mockProps} showSaveTemplateModal={true} />
    );
    const saveButton = screen.getByRole("button", { name: "Guardar" });
    fireEvent.click(saveButton);
    expect(mockProps.handleSaveTemplate).toHaveBeenCalledTimes(1);
  });

  it("should close the save template modal when 'Cancelar' button is clicked", () => {
    render(
      <HorarioConfirmationModals {...mockProps} showSaveTemplateModal={true} />
    );
    const cancelButton = screen.getByRole("button", { name: "Cancelar" });
    fireEvent.click(cancelButton);
    expect(mockProps.setShowSaveTemplateModal).toHaveBeenCalledWith(false);
  });

  // --- Caso de prueba 2: Modal de confirmación de eliminación (Delete) ---
  it("should show the delete confirmation modal when showDeleteModal is true", () => {
    render(<HorarioConfirmationModals {...mockProps} showDeleteModal={true} />);
    expect(screen.getByText("Confirmar eliminación")).toBeInTheDocument();
    expect(
      screen.getByText(
        "¿Estás seguro de que deseas eliminar este bloque de horario?"
      )
    ).toBeInTheDocument();
  });

  it("should call handleConfirmDeleteHorario when the 'Sí, eliminar' button is clicked", () => {
    render(<HorarioConfirmationModals {...mockProps} showDeleteModal={true} />);
    const deleteButton = screen.getByRole("button", { name: "Sí, eliminar" });
    fireEvent.click(deleteButton);
    expect(mockProps.handleConfirmDeleteHorario).toHaveBeenCalledTimes(1);
  });

  it("should close the delete modal when 'Cancelar' button is clicked", () => {
    render(<HorarioConfirmationModals {...mockProps} showDeleteModal={true} />);
    const cancelButton = screen.getByRole("button", { name: "Cancelar" });
    fireEvent.click(cancelButton);
    expect(mockProps.setShowDeleteModal).toHaveBeenCalledWith(false);
  });
});
