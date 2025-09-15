import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import HorarioForms from "./HorarioForms";

// Mock the external dependency DIAS_SEMANA_MAP to isolate the component
jest.mock("../../../pages/HorarioDoctorPage", () => ({
  DIAS_SEMANA_MAP: [
    { value: "Lunes", label: "Lunes" },
    { value: "Martes", label: "Martes" },
    { value: "Miércoles", label: "Miércoles" },
  ],
}));

// A test wrapper component to handle state, as in a real application
const TestWrapper = ({ initialForm, onHide, currentEdit }) => {
  const [form, setForm] = useState(initialForm);

  // This mock function mimics the real parent component's state update logic
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <HorarioForms
      show={true}
      onHide={onHide}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      form={form}
      currentEdit={currentEdit}
    />
  );
};

describe("HorarioForms", () => {
  const initialForm = {
    dia_semana: "Lunes",
    hora_inicio: "09:00",
    hora_fin: "17:00",
  };
  const mockOnHide = jest.fn();

  it("should render the modal for adding a new schedule", () => {
    render(
      <TestWrapper
        initialForm={initialForm}
        onHide={mockOnHide}
        currentEdit={null}
      />
    );
    expect(screen.getByText("Añadir Nuevo Horario")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Guardar Horario" })
    ).toBeInTheDocument();
  });

  it("should render the modal for editing a schedule", () => {
    const editForm = { ...initialForm, id: "1" };
    render(
      <TestWrapper
        initialForm={editForm}
        onHide={mockOnHide}
        currentEdit={editForm}
      />
    );
    expect(screen.getByText("Editar Horario")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Guardar Cambios" })
    ).toBeInTheDocument();
  });

  it("should update the input value when a form field is changed", () => {
    render(
      <TestWrapper
        initialForm={initialForm}
        onHide={mockOnHide}
        currentEdit={null}
      />
    );

    const horaInicioInput = screen.getByLabelText(/hora de inicio/i);
    const newTime = "11:00";

    // Simulate the change event by providing the new value
    fireEvent.change(horaInicioInput, { target: { value: newTime } });

    // We assert on the DOM to confirm the value has changed.
    expect(horaInicioInput.value).toBe(newTime);
  });

  it("should call handleSubmit when the form is submitted", () => {
    const mockHandleSubmit = jest.fn((e) => e.preventDefault());
    render(
      <HorarioForms
        show={true}
        onHide={mockOnHide}
        handleInputChange={() => {}} // A dummy function for this test
        handleSubmit={mockHandleSubmit}
        form={initialForm}
        currentEdit={null}
      />
    );

    const formElement = screen.getByTestId("horario-form");

    fireEvent.submit(formElement);

    expect(mockHandleSubmit).toHaveBeenCalledTimes(1);
  });

  it("should call onHide when the close button is clicked", () => {
    render(
      <TestWrapper
        initialForm={initialForm}
        onHide={mockOnHide}
        currentEdit={null}
      />
    );
    const closeButton = screen.getByRole("button", { name: /close/i });
    fireEvent.click(closeButton);
    expect(mockOnHide).toHaveBeenCalledTimes(1);
  });
});
