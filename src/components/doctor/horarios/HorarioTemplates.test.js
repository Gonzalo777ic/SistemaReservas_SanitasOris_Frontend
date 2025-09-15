import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import HorarioTemplates from "./HorarioTemplates";

// Mock data for the saved templates
const mockSavedSchedules = [
  { id: "1", nombre: "Horario de Mañana", es_activo: false },
  { id: "2", nombre: "Horario de Tarde", es_activo: true },
  { id: "3", nombre: "Jornada Completa", es_activo: false },
];

describe("HorarioTemplates", () => {
  const mockSetSelectedTemplate = jest.fn();
  const mockOnSaveTemplateClick = jest.fn();
  const mockOnApplyTemplate = jest.fn();
  const mockOnActivateTemplate = jest.fn();

  it("should render all buttons and the select dropdown", () => {
    render(
      <HorarioTemplates
        savedSchedules={[]}
        selectedTemplate=""
        setSelectedTemplate={mockSetSelectedTemplate}
        onSaveTemplateClick={mockOnSaveTemplateClick}
        onApplyTemplate={mockOnApplyTemplate}
        onActivateTemplate={mockOnActivateTemplate}
      />
    );

    // Assert that all buttons are in the document
    expect(
      screen.getByRole("button", { name: /Guardar como Plantilla/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Ver Horario/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Activar/i })
    ).toBeInTheDocument();

    // Assert that the dropdown is in the document
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should disable 'Ver Horario' and 'Activar' buttons when no template is selected", () => {
    render(
      <HorarioTemplates
        savedSchedules={mockSavedSchedules}
        selectedTemplate=""
        setSelectedTemplate={mockSetSelectedTemplate}
        onSaveTemplateClick={mockOnSaveTemplateClick}
        onApplyTemplate={mockOnApplyTemplate}
        onActivateTemplate={mockOnActivateTemplate}
      />
    );

    // Assert that the buttons are disabled
    expect(screen.getByRole("button", { name: /Ver Horario/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /Activar/i })).toBeDisabled();
  });

  it("should enable 'Ver Horario' and 'Activar' buttons when a template is selected", () => {
    render(
      <HorarioTemplates
        savedSchedules={mockSavedSchedules}
        selectedTemplate="1"
        setSelectedTemplate={mockSetSelectedTemplate}
        onSaveTemplateClick={mockOnSaveTemplateClick}
        onApplyTemplate={mockOnApplyTemplate}
        onActivateTemplate={mockOnActivateTemplate}
      />
    );

    // Assert that the buttons are enabled
    expect(screen.getByRole("button", { name: /Ver Horario/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /Activar/i })).toBeEnabled();
  });

  it("should populate the select dropdown with saved schedules and indicate the active one", () => {
    render(
      <HorarioTemplates
        savedSchedules={mockSavedSchedules}
        selectedTemplate=""
        setSelectedTemplate={mockSetSelectedTemplate}
        onSaveTemplateClick={mockOnSaveTemplateClick}
        onApplyTemplate={mockOnApplyTemplate}
        onActivateTemplate={mockOnActivateTemplate}
      />
    );

    // Assert that each template is present as an option
    expect(
      screen.getByRole("option", { name: "Selecciona una plantilla..." })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Horario de Mañana" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Horario de Tarde (Activo)" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Jornada Completa" })
    ).toBeInTheDocument();
  });

  it("should call onSaveTemplateClick when 'Guardar como Plantilla' button is clicked", () => {
    render(
      <HorarioTemplates
        savedSchedules={mockSavedSchedules}
        selectedTemplate=""
        setSelectedTemplate={mockSetSelectedTemplate}
        onSaveTemplateClick={mockOnSaveTemplateClick}
        onApplyTemplate={mockOnApplyTemplate}
        onActivateTemplate={mockOnActivateTemplate}
      />
    );

    fireEvent.click(
      screen.getByRole("button", { name: /Guardar como Plantilla/i })
    );
    expect(mockOnSaveTemplateClick).toHaveBeenCalledTimes(1);
  });

  it("should call onApplyTemplate when 'Ver Horario' is clicked with a selected template", () => {
    render(
      <HorarioTemplates
        savedSchedules={mockSavedSchedules}
        selectedTemplate="1"
        setSelectedTemplate={mockSetSelectedTemplate}
        onSaveTemplateClick={mockOnSaveTemplateClick}
        onApplyTemplate={mockOnApplyTemplate}
        onActivateTemplate={mockOnActivateTemplate}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Ver Horario/i }));
    expect(mockOnApplyTemplate).toHaveBeenCalledTimes(1);
  });

  it("should call onActivateTemplate when 'Activar' is clicked with a selected template", () => {
    render(
      <HorarioTemplates
        savedSchedules={mockSavedSchedules}
        selectedTemplate="1"
        setSelectedTemplate={mockSetSelectedTemplate}
        onSaveTemplateClick={mockOnSaveTemplateClick}
        onApplyTemplate={mockOnApplyTemplate}
        onActivateTemplate={mockOnActivateTemplate}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Activar/i }));
    expect(mockOnActivateTemplate).toHaveBeenCalledTimes(1);
  });
});
