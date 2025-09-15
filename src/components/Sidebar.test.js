import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "./Sidebar";

// Mock de las dependencias externas
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  NavLink: ({ to, children, className }) => (
    <a
      href={to}
      className={
        typeof className === "function"
          ? className({ isActive: to === "/current-path" })
          : className
      }
    >
      {children}
    </a>
  ),
}));

describe("Sidebar", () => {
  // Caso de prueba para el rol 'admin'
  it("should render admin links when userRole is 'admin'", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard-admin"]}>
        <Sidebar userRole="admin" />
      </MemoryRouter>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Pacientes")).toBeInTheDocument();
    expect(screen.getByText("Reservas")).toBeInTheDocument();
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Procedimientos")).toBeInTheDocument();
    expect(screen.getByText("Perfil")).toBeInTheDocument();
    expect(screen.queryByText("Mis pacientes")).not.toBeInTheDocument();
  });

  // Caso de prueba para el rol 'doctor'
  it("should render doctor links when userRole is 'doctor'", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard-doctor"]}>
        <Sidebar userRole="doctor" />
      </MemoryRouter>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Horario")).toBeInTheDocument();
    expect(screen.getByText("Mis pacientes")).toBeInTheDocument();
    expect(screen.getByText("Citas")).toBeInTheDocument();
    expect(screen.getByText("Perfil")).toBeInTheDocument();
    expect(screen.queryByText("Pacientes")).not.toBeInTheDocument();
    expect(screen.queryByText("Reservar Cita")).not.toBeInTheDocument();
  });

  // Caso de prueba para el rol 'paciente'
  it("should render patient links when userRole is 'paciente'", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard-paciente"]}>
        <Sidebar userRole="paciente" />
      </MemoryRouter>
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Reservar Cita")).toBeInTheDocument();
    expect(screen.getByText("Historial")).toBeInTheDocument();
    expect(screen.getByText("Perfil")).toBeInTheDocument();
    expect(screen.queryByText("Horario")).not.toBeInTheDocument();
    expect(screen.queryByText("Users")).not.toBeInTheDocument();
  });

  // Caso de prueba para un rol no válido o no proporcionado
  it("should render no links when userRole is invalid or not provided", () => {
    render(
      <MemoryRouter>
        <Sidebar userRole="invalid-role" />
      </MemoryRouter>
    );
    // Verificar que ninguno de los enlaces de los roles conocidos estén en el documento
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Pacientes")).not.toBeInTheDocument();
    expect(screen.queryByText("Horario")).not.toBeInTheDocument();
  });
});
