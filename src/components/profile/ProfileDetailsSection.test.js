import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import DoctorProceduresSection from "./DoctorProceduresSection";

describe("DoctorProceduresSection", () => {
  // Mock de datos de procedimientos para la prueba con contenido
  const mockProcedures = [
    { id: "1", nombre: "Limpieza Dental", duracion_min: 30 },
    { id: "2", nombre: "Extracción Molar", duracion_min: 60 },
  ];

  // Mock de un array vacío para la prueba sin contenido
  const mockEmptyProcedures = [];

  // --- Prueba para cuando hay procedimientos asignados ---
  it("should render the list of procedures when available", () => {
    // Renderizamos el componente con el array de procedimientos mock
    render(<DoctorProceduresSection procedimientos={mockProcedures} />);

    // Verificamos que el encabezado principal esté presente
    expect(screen.getByText("Procedimientos que realiza")).toBeInTheDocument();

    // Verificamos que el párrafo de la descripción esté presente
    expect(
      screen.getByText(
        "Esta es la lista de los procedimientos que el administrador te ha asignado. Si necesitas agregar o eliminar alguno, por favor, notifícaselo al administrador."
      )
    ).toBeInTheDocument();

    // Verificamos que cada procedimiento de la lista se renderice
    expect(screen.getByText("Limpieza Dental")).toBeInTheDocument();
    expect(screen.getByText("Extracción Molar")).toBeInTheDocument();

    // Verificamos que la duración de cada procedimiento también se muestre
    expect(screen.getByText("Duración: 30 min")).toBeInTheDocument();
    expect(screen.getByText("Duración: 60 min")).toBeInTheDocument();

    // Verificamos que el mensaje de advertencia NO esté presente
    expect(
      screen.queryByText("Actualmente no tienes procedimientos asignados.")
    ).not.toBeInTheDocument();
  });

  // --- Prueba para cuando NO hay procedimientos asignados ---
  it("should render a warning message when there are no procedures", () => {
    // Renderizamos el componente con un array vacío
    render(<DoctorProceduresSection procedimientos={mockEmptyProcedures} />);

    // Verificamos que el encabezado principal y la descripción sigan estando presentes
    expect(screen.getByText("Procedimientos que realiza")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Esta es la lista de los procedimientos que el administrador te ha asignado. Si necesitas agregar o eliminar alguno, por favor, notifícaselo al administrador."
      )
    ).toBeInTheDocument();

    // Verificamos que el mensaje de advertencia esté visible
    expect(
      screen.getByText("Actualmente no tienes procedimientos asignados.")
    ).toBeInTheDocument();

    // Verificamos que la lista de procedimientos NO se renderice
    expect(screen.queryByText("Limpieza Dental")).not.toBeInTheDocument();
  });
});
