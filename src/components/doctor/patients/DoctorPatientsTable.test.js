import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import DoctorPatientsTable from "./DoctorPatientsTable";

describe("DoctorPatientsTable", () => {
  // Mock data for a list of patients
  const mockPatients = [
    {
      id: "1",
      user: {
        first_name: "Juan",
        last_name: "Pérez",
        email: "juan.perez@example.com",
      },
      telefono: "1234567890",
    },
    {
      id: "2",
      user: {
        first_name: "Ana",
        last_name: "García",
        email: "ana.garcia@example.com",
      },
      telefono: null, // Test case with missing phone
    },
    {
      id: "3",
      // Test case with missing user object
      first_name: "Pedro",
      last_name: "López",
      email: "pedro.lopez@example.com",
      telefono: "9876543210",
    },
  ];

  it("should render the table with patient data when the patients array is not empty", () => {
    render(<DoctorPatientsTable patients={mockPatients} />);

    // Assert that the table headers are present
    expect(screen.getByText("Nombre")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("Teléfono")).toBeInTheDocument();

    // Assert that each patient's data is rendered correctly
    expect(screen.getByText("Juan Pérez")).toBeInTheDocument();
    expect(screen.getByText("juan.perez@example.com")).toBeInTheDocument();
    expect(screen.getByText("1234567890")).toBeInTheDocument();

    expect(screen.getByText("Ana García")).toBeInTheDocument();
    expect(screen.getByText("ana.garcia@example.com")).toBeInTheDocument();
    expect(screen.getByText("N/A")).toBeInTheDocument(); // Assert N/A for missing phone

    expect(screen.getByText("Pedro López")).toBeInTheDocument();
    expect(screen.getByText("pedro.lopez@example.com")).toBeInTheDocument();
    expect(screen.getByText("9876543210")).toBeInTheDocument();
  });

  it("should render the 'No hay pacientes registrados' message when the patients array is empty", () => {
    render(<DoctorPatientsTable patients={[]} />);

    // Assert that the empty state message is present
    expect(
      screen.getByText("No hay pacientes registrados.")
    ).toBeInTheDocument();

    // Assert that the table body rows are not present
    expect(screen.queryByText("Juan Pérez")).not.toBeInTheDocument();
    expect(screen.queryByText("Ana García")).not.toBeInTheDocument();
  });
});
