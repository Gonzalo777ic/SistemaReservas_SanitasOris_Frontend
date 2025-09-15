import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import ProfileInfoCard from "./ProfileInfoCard";

// Mock de los subcomponentes para aislarlos y probar solo ProfileInfoCard
jest.mock("./ProfileDetailsSection", () => {
  return () => <div data-testid="profile-details-section"></div>;
});

jest.mock("./ContactInfoSection", () => {
  return () => <div data-testid="contact-info-section"></div>;
});

jest.mock("./DoctorProceduresSection", () => {
  return () => <div data-testid="doctor-procedures-section"></div>;
});

describe("ProfileInfoCard", () => {
  const mockProps = {
    user: {
      picture: "https://example.com/profile.jpg",
    },
    profile: {
      user: {
        first_name: "Juan",
        last_name: "Pérez",
        email: "juan.perez@example.com",
      },
    },
    userRole: "paciente",
    isEditing: false,
    phoneNumber: "123-456-7890",
    setPhoneNumber: jest.fn(),
    specialty: "Odontología",
    setSpecialty: jest.fn(),
    handleSaveProfile: jest.fn(),
    handleCancelEdit: jest.fn(),
    isSaving: false,
    message: { text: "", type: "" },
    setMessage: jest.fn(),
    procedimientos: [],
    setIsEditing: jest.fn(),
  };

  // --- Pruebas de renderizado y lógica condicional ---

  it("should render profile info card for a patient correctly", () => {
    render(<ProfileInfoCard {...mockProps} userRole="paciente" />);

    expect(screen.getByText(/Juan/)).toBeInTheDocument();
    expect(screen.getByText(/Pérez/)).toBeInTheDocument();
    expect(screen.getByText("paciente")).toBeInTheDocument();

    expect(screen.getByTestId("profile-details-section")).toBeInTheDocument();
    expect(screen.getByTestId("contact-info-section")).toBeInTheDocument();

    expect(
      screen.queryByTestId("doctor-procedures-section")
    ).not.toBeInTheDocument();
  });

  it("should render profile info card for a doctor correctly", () => {
    const doctorProps = {
      ...mockProps,
      userRole: "doctor",
      procedimientos: [{ id: "1", nombre: "Limpieza" }],
    };
    render(<ProfileInfoCard {...doctorProps} />);

    expect(screen.getByText(/Juan/)).toBeInTheDocument();
    expect(screen.getByText(/Pérez/)).toBeInTheDocument();

    expect(screen.getByTestId("profile-details-section")).toBeInTheDocument();
    expect(screen.getByTestId("contact-info-section")).toBeInTheDocument();

    expect(screen.getByTestId("doctor-procedures-section")).toBeInTheDocument();
  });

  // --- Prueba para los mensajes de alerta ---
  it("should display a success message when message prop is provided", () => {
    const successProps = {
      ...mockProps,
      message: { text: "Perfil actualizado correctamente.", type: "success" },
    };
    render(<ProfileInfoCard {...successProps} />);

    const alertMessage = screen.getByText("Perfil actualizado correctamente.");
    expect(alertMessage).toBeInTheDocument();
    expect(alertMessage).toHaveClass("alert-success");
  });

  it("should display an error message when message prop is provided", () => {
    const errorProps = {
      ...mockProps,
      message: { text: "Error al actualizar el perfil.", type: "danger" },
    };
    render(<ProfileInfoCard {...errorProps} />);

    const alertMessage = screen.getByText("Error al actualizar el perfil.");
    expect(alertMessage).toBeInTheDocument();
    expect(alertMessage).toHaveClass("alert-danger");
  });
});
