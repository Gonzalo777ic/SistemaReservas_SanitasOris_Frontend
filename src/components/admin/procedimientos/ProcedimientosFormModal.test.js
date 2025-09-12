// src/components/admin/procedimientos/ProcedimientoFormModal.test.js

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import ProcedimientoFormModal from "./ProcedimientoFormModal";
// Mock react-select to simplify testing as it's an external library
jest.mock("react-select", () => {
  const Select = ({ options, value, onChange, isMulti, inputId }) => {
    // Corrected line: Ensure values are always strings.
    const nativeSelectValue = isMulti
      ? value?.map((v) => String(v.value)) || []
      : String(value?.value) || "";

    return (
      <select
        data-testid="doctor-select"
        id={inputId}
        multiple={isMulti}
        value={nativeSelectValue}
        onChange={(e) => {
          let selectedOptions;
          if (isMulti) {
            selectedOptions = Array.from(e.target.options)
              .filter((option) => option.selected)
              .map((option) => ({
                value: Number(option.value),
                label: option.label,
              }));
          } else {
            const selectedOption = options.find(
              (o) => String(o.value) === e.target.value
            );
            selectedOptions = selectedOption
              ? {
                  value: Number(selectedOption.value),
                  label: selectedOption.label,
                }
              : null;
          }
          onChange(selectedOptions);
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  };
  Select.is = true;
  return Select;
});

describe("ProcedimientoFormModal", () => {
  // Mock props... (The same as before)
  const mockDoctorOptions = [
    { value: 1, label: "Dr. Smith" },
    { value: 2, label: "Dr. Jones" },
  ];

  const defaultFormData = {
    nombre: "",
    descripcion: "",
    duracion_min: 0,
    activo: false,
    doctores: [],
    imagen: null,
  };

  const mockHandleChange = jest.fn();
  const mockHandleSelectChange = jest.fn();
  const mockHandleSubmit = jest.fn();
  const mockOnHide = jest.fn();

  const renderModal = (props) => {
    return render(
      <ProcedimientoFormModal
        show={true}
        onHide={mockOnHide}
        isEditing={false}
        currentProcedimiento={null}
        formData={defaultFormData}
        handleChange={mockHandleChange}
        handleSelectChange={mockHandleSelectChange}
        handleSubmit={mockHandleSubmit}
        doctorOptions={mockDoctorOptions}
        {...props}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test cases that passed before...
  it('should render "Nuevo Procedimiento" title in new mode', () => {
    renderModal({ isEditing: false });
    expect(screen.getByText("Nuevo Procedimiento")).toBeInTheDocument();
  });

  it('should render "Editar Procedimiento" title in edit mode', () => {
    renderModal({ isEditing: true });
    expect(screen.getByText("Editar Procedimiento")).toBeInTheDocument();
  });

  it("should display initial form data when editing", () => {
    const editingFormData = {
      nombre: "Limpieza Dental",
      descripcion: "Remoción de placa y sarro",
      duracion_min: 60,
      activo: true,
      doctores: [1], // This is a number
      imagen: null,
    };
    const currentProcedimientoWithImage = {
      imagen: "http://example.com/image.jpg",
    };

    renderModal({
      isEditing: true,
      formData: editingFormData,
      currentProcedimiento: currentProcedimientoWithImage,
    });

    expect(screen.getByLabelText("Nombre")).toHaveValue("Limpieza Dental");
    expect(screen.getByLabelText("Descripción")).toHaveValue(
      "Remoción de placa y sarro"
    );
    expect(screen.getByLabelText("Duración (minutos)")).toHaveValue(60);
    expect(screen.getByLabelText("Activo")).toBeChecked();

    // CORRECTED ASSERTION: Check for an array of strings
    expect(screen.getByTestId("doctor-select")).toHaveValue(["1"]);
  });

  it("should call handleChange when a text input value changes", () => {
    renderModal();
    const nombreInput = screen.getByLabelText("Nombre");
    fireEvent.change(nombreInput, {
      target: { name: "nombre", value: "Implante" },
    });
    expect(mockHandleChange).toHaveBeenCalledTimes(1);
    expect(mockHandleChange).toHaveBeenCalledWith(expect.any(Object));
  });

  it("should call handleChange when the active checkbox is toggled", () => {
    renderModal();
    const activoCheckbox = screen.getByLabelText("Activo");
    fireEvent.click(activoCheckbox);
    expect(mockHandleChange).toHaveBeenCalledTimes(1);
    expect(mockHandleChange).toHaveBeenCalledWith(expect.any(Object));
  });

  it("should call handleSelectChange when doctor selection changes", () => {
    renderModal();
    const doctorSelect = screen.getByTestId("doctor-select");

    // Simulate selecting the first doctor (Dr. Smith)
    fireEvent.change(doctorSelect, {
      target: { value: "1" }, // New way to simulate single select change on the mock
    });

    expect(mockHandleSelectChange).toHaveBeenCalledTimes(1);
    expect(mockHandleSelectChange).toHaveBeenCalledWith([
      { value: 1, label: "Dr. Smith" },
    ]);
  });

  it("should call handleChange when a file is selected", () => {
    renderModal();
    const fileInput = screen.getByLabelText("Imagen");
    const file = new File(["dummy content"], "test.png", { type: "image/png" });
    fireEvent.change(fileInput, { target: { name: "imagen", files: [file] } });
    expect(mockHandleChange).toHaveBeenCalledTimes(1);
    expect(mockHandleChange).toHaveBeenCalledWith(expect.any(Object));
  });

  it("should call handleSubmit when the form is submitted", () => {
    renderModal();
    // Use `fireEvent.submit` on the form itself, not the button.
    const formElement = screen.getByTestId("procedimiento-form");
    fireEvent.submit(formElement);
    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });

  it("should call onHide when the Cancel button is clicked", () => {
    renderModal();
    const cancelButton = screen.getByRole("button", { name: "Cancelar" });
    fireEvent.click(cancelButton);
    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });

  it("should show current image preview when in edit mode and image exists in currentProcedimiento but not in formData", () => {
    const currentProcedimientoWithImage = {
      imagen: "http://example.com/path/to/image.jpg",
    };
    renderModal({
      isEditing: true,
      currentProcedimiento: currentProcedimientoWithImage,
      formData: { ...defaultFormData, imagen: null }, // Ensure formData.imagen is null for preview to show
    });

    const imgElement = screen.getByAltText("Actual");
    expect(imgElement).toBeInTheDocument();
    expect(imgElement).toHaveAttribute(
      "src",
      "http://example.com/path/to/image.jpg"
    );
  });

  it("should NOT show current image preview if not in edit mode", () => {
    const currentProcedimientoWithImage = {
      imagen: "http://example.com/path/to/image.jpg",
    };
    renderModal({
      isEditing: false, // Not in edit mode
      currentProcedimiento: currentProcedimientoWithImage,
      formData: { ...defaultFormData, imagen: null },
    });

    expect(screen.queryByAltText("Actual")).not.toBeInTheDocument();
  });

  it("should NOT show current image preview if formData.imagen is present", () => {
    const currentProcedimientoWithImage = {
      imagen: "http://example.com/path/to/old-image.jpg",
    };
    renderModal({
      isEditing: true,
      currentProcedimiento: currentProcedimientoWithImage,
      formData: {
        ...defaultFormData,
        imagen: new File(["new content"], "new.png", { type: "image/png" }),
      }, // New image selected
    });

    expect(screen.queryByAltText("Actual")).not.toBeInTheDocument();
  });
});
