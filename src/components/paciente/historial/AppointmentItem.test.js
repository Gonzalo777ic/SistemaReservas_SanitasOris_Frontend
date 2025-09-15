import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import AppointmentItem from "./AppointmentItem";

describe("AppointmentItem", () => {
  // Mock data for a confirmed appointment
  const mockCitaConfirmed = {
    id: 1,
    doctor: {
      user: { first_name: "Ana" },
    },
    // La 'Z' indica UTC. 10:00 UTC es 05:00 en UTC-5.
    fecha_hora: "2023-11-15T10:00:00Z",
    estado: "confirmada",
    procedimiento: { nombre: "Limpieza Dental" },
    notas_doctor: "El paciente llegó a tiempo. Todo en orden.",
  };

  // Mock data for a pending appointment with missing data
  const mockCitaPending = {
    id: 2,
    doctor: { nombre: "Dr. Juan" }, // Test for the fallback to nombre
    fecha_hora: "2023-11-16T15:30:00Z",
    estado: "pendiente",
    procedimiento: null, // Missing procedure
    notas_doctor: null, // Missing notes
  };

  // Mock data for a completed appointment
  const mockCitaCompleted = {
    id: 3,
    doctor: { user: { first_name: "Pedro" } },
    fecha_hora: "2023-11-14T09:00:00Z",
    estado: "completada",
    procedimiento: { nombre: "Extracción Molar" },
    notas_doctor: "Extracción completada sin complicaciones.",
  };

  // Mock data for a canceled appointment
  const mockCitaCanceled = {
    id: 4,
    doctor: { user: { first_name: "Laura" } },
    fecha_hora: "2023-11-13T11:45:00Z",
    estado: "cancelada",
    procedimiento: { nombre: "Radiografía Panorámica" },
    notas_doctor: "Paciente canceló 24h antes.",
  };

  it("should render appointment details correctly for a confirmed appointment", () => {
    render(<AppointmentItem cita={mockCitaConfirmed} />);

    // Check for the correct badge and text
    expect(screen.getByText("Confirmada")).toBeInTheDocument();
    expect(screen.getByText("Confirmada")).toHaveClass("bg-success");

    // Check for the doctor's name
    expect(screen.getByText("Cita con Dr(a). Ana")).toBeInTheDocument();

    // Validamos la fecha y hora sin depender de la zona horaria del entorno
    const expectedTime = format(
      new Date(mockCitaConfirmed.fecha_hora),
      "dd MMMM yyyy HH:mm",
      { locale: es }
    );
    expect(screen.getByText(expectedTime)).toBeInTheDocument();

    // Check for procedure and notes
    expect(screen.getByText("Limpieza Dental")).toBeInTheDocument();
    expect(
      screen.getByText("El paciente llegó a tiempo. Todo en orden.")
    ).toBeInTheDocument();
  });

  it("should render correct status badge for a pending appointment", () => {
    render(<AppointmentItem cita={mockCitaPending} />);

    // Check for the correct badge and text
    expect(screen.getByText("Pendiente")).toBeInTheDocument();
    expect(screen.getByText("Pendiente")).toHaveClass("bg-warning");
  });

  it("should render correct status badge for a completed appointment", () => {
    render(<AppointmentItem cita={mockCitaCompleted} />);

    // Check for the correct badge and text
    expect(screen.getByText("Completada")).toBeInTheDocument();
    expect(screen.getByText("Completada")).toHaveClass("bg-primary");
  });

  it("should render correct status badge for a canceled appointment", () => {
    render(<AppointmentItem cita={mockCitaCanceled} />);

    // Check for the correct badge and text
    expect(screen.getByText("Cancelada")).toBeInTheDocument();
    expect(screen.getByText("Cancelada")).toHaveClass("bg-danger");
  });

  it("should display 'N/A' and a fallback message for missing data", () => {
    render(<AppointmentItem cita={mockCitaPending} />);

    // Check for the doctor name fallback
    expect(screen.getByText("Cita con Dr(a). Dr. Juan")).toBeInTheDocument();

    // Check for missing notes message
    expect(
      screen.getByText("No hay notas para esta cita.")
    ).toBeInTheDocument();

    // Verificamos "Procedimiento:" y "N/A" en nodos de texto separados
    expect(screen.getByText("Procedimiento:")).toBeInTheDocument();
    expect(screen.getByText("N/A")).toBeInTheDocument();
  });
});
