// src/components/admin/patients/PatientSearchBar.test.js

import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import PatientSearchBar from "./PatientSearchBar";

describe("PatientSearchBar", () => {
  it("should render the search input with the initial search term", () => {
    // 1. Arrange: Define the initial search term
    const initialTerm = "John Doe";

    // 2. Act: Render the component with the initial term as a prop
    render(
      <PatientSearchBar searchTerm={initialTerm} setSearchTerm={() => {}} />
    );

    // 3. Assert: Check if the input value matches the initial term
    const searchInput = screen.getByPlaceholderText(
      "Buscar pacientes por nombre, apellido o email..."
    );
    expect(searchInput).toHaveValue(initialTerm);
  });

  it("should call setSearchTerm when the input value changes", () => {
    // 1. Arrange: Create a mock function to track calls to setSearchTerm
    const mockSetSearchTerm = jest.fn();

    render(
      <PatientSearchBar searchTerm="" setSearchTerm={mockSetSearchTerm} />
    );

    // Get the input element by its placeholder text
    const searchInput = screen.getByPlaceholderText(
      "Buscar pacientes por nombre, apellido o email..."
    );

    // 2. Act: Simulate a user typing "Jane" into the input
    fireEvent.change(searchInput, { target: { value: "Jane" } });

    // 3. Assert: Check if the mock function was called correctly
    // The mock function should have been called once
    expect(mockSetSearchTerm).toHaveBeenCalledTimes(1);

    // The mock function should have been called with the new value
    expect(mockSetSearchTerm).toHaveBeenCalledWith("Jane");
  });
});
