// src/components/admin/patients/PatientsTable.test.js

import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import PatientsTable from "./PatientsTable";

describe("PatientsTable", () => {
  const mockPatients = [
    {
      id: 1,
      user: {
        first_name: "Juan",
        last_name: "Pérez",
        email: "juan.perez@example.com",
      },
      telefono: "123-456-7890",
      fecha_registro: "2025-01-15T10:00:00Z",
    },
    {
      id: 2,
      user: {
        first_name: "Ana",
        last_name: "García",
        email: "ana.garcia@example.com",
      },
      telefono: "987-654-3210",
      fecha_registro: "2025-02-20T11:30:00Z",
    },
  ];

  it("should render a table with patient data when a non-empty array is provided", () => {
    // 1. Arrange & Act: Render the component with our mock data
    render(<PatientsTable patients={mockPatients} />);

    // 2. Assert: Check for elements that should be present
    // The table headers should be present
    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("Apellido")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();

    // The data for the first patient should be in the document
    expect(screen.getByText("Juan")).toBeInTheDocument();
    expect(screen.getByText("Pérez")).toBeInTheDocument();
    expect(screen.getByText("juan.perez@example.com")).toBeInTheDocument();
    expect(screen.getByText("123-456-7890")).toBeInTheDocument();

    // The data for the second patient should also be in the document
    expect(screen.getByText("Ana")).toBeInTheDocument();
    expect(screen.getByText("García")).toBeInTheDocument();
    expect(screen.getByText("987-654-3210")).toBeInTheDocument();
  });

  it("should display a 'No se encontraron pacientes' message when the patients array is empty", () => {
    // 1. Arrange & Act: Render the component with an empty array
    render(<PatientsTable patients={[]} />);

    // 2. Assert: Check if the "not found" message is present
    expect(
      screen.getByText("No se encontraron pacientes.")
    ).toBeInTheDocument();

    // Assert that no patient data is present
    expect(screen.queryByText("Juan")).not.toBeInTheDocument();
    expect(screen.queryByText("Ana")).not.toBeInTheDocument();
  });
});
