import { useAuth0 } from "@auth0/auth0-react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { api } from "../services/api";
import ProcedimientosPage from "./ProcedimientosPage";

// Mock de las dependencias
jest.mock("@auth0/auth0-react");
jest.mock("../services/api");

// Mock de los componentes hijos para aislar la prueba
jest.mock("../components/Sidebar", () => () => <div data-testid="sidebar" />);
jest.mock(
  "../components/admin/procedimientos/ProcedimientosTable",
  () =>
    ({ procedimientos, onEdit, onDelete }) =>
      (
        <div data-testid="procedimientos-table">
          {procedimientos.map((p) => (
            <div key={p.id}>
              {p.nombre}
              <button
                onClick={() => onEdit(p)}
                data-testid={`edit-btn-${p.id}`}
              >
                Editar
              </button>
              <button
                onClick={() => onDelete(p.id)}
                data-testid={`delete-btn-${p.id}`}
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )
);
jest.mock(
  "../components/admin/procedimientos/ProcedimientoFormModal",
  () =>
    ({
      show,
      onHide,
      formData,
      handleChange,
      handleSelectChange,
      handleSubmit,
      doctorOptions,
    }) =>
      show ? (
        <div data-testid="procedimiento-modal">
          <form onSubmit={handleSubmit}>
            <input
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              data-testid="form-nombre"
            />
            <input
              name="duracion_min"
              value={formData.duracion_min}
              onChange={handleChange}
              type="number"
              data-testid="form-duracion"
            />
            <button type="submit" data-testid="submit-button">
              Guardar
            </button>
            <button onClick={onHide} data-testid="cancel-button">
              Cancelar
            </button>
          </form>
        </div>
      ) : null
);

describe("ProcedimientosPage", () => {
  const mockProcedimientos = [
    {
      id: 1,
      nombre: "Limpieza Dental",
      duracion_min: 30,
      activo: true,
      doctores: [101],
    },
    {
      id: 2,
      nombre: "Ortodoncia",
      duracion_min: 60,
      activo: false,
      doctores: [102],
    },
  ];

  const mockDoctores = [
    { id: 101, nombre: "Dr. Ana Ruiz", especialidad: "Odontología" },
    { id: 102, nombre: "Dr. Carlos Solís", especialidad: "Ortodoncia" },
  ];

  const mockToken = "mock-token";

  beforeEach(() => {
    useAuth0.mockReturnValue({
      getAccessTokenSilently: jest.fn().mockResolvedValue(mockToken),
    });

    api.get.mockImplementation((url) => {
      if (url.includes("procedimientos")) {
        return Promise.resolve({ data: mockProcedimientos });
      }
      if (url.includes("doctores")) {
        return Promise.resolve({ data: mockDoctores });
      }
      return Promise.reject(new Error("URL no reconocida"));
    });

    api.post.mockResolvedValue({
      data: { id: 3, nombre: "Nuevo Procedimiento" },
    });
    api.put.mockResolvedValue({
      data: { id: 1, nombre: "Procedimiento Editado" },
    });
    api.delete.mockResolvedValue({});

    // Mockear window.confirm para evitar que se abra un diálogo en las pruebas
    window.confirm = jest.fn(() => true);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("debe mostrar el estado de carga y luego la tabla de procedimientos", async () => {
    render(<ProcedimientosPage />);
    expect(screen.getByText("Cargando procedimientos...")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.queryByText("Cargando procedimientos...")
      ).not.toBeInTheDocument();
      expect(screen.getByTestId("procedimientos-table")).toBeInTheDocument();
      expect(screen.getByText("Limpieza Dental")).toBeInTheDocument();
    });
  });

  it("debe mostrar un mensaje de error si la carga de datos falla", async () => {
    api.get.mockRejectedValue(new Error("Error de red"));
    render(<ProcedimientosPage />);
    await waitFor(() => {
      expect(
        screen.getByText("Error al cargar los procedimientos y doctores.")
      ).toBeInTheDocument();
    });
  });

  it("debe abrir el modal para crear un nuevo procedimiento", async () => {
    render(<ProcedimientosPage />);
    await waitFor(() => {
      expect(
        screen.queryByText("Cargando procedimientos...")
      ).not.toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole("button", { name: /nuevo procedimiento/i })
    );
    expect(screen.getByTestId("procedimiento-modal")).toBeInTheDocument();
    expect(screen.getByTestId("form-nombre")).toHaveValue("");
    expect(screen.getByTestId("form-duracion")).toHaveValue(30);
  });

  it("debe abrir el modal para editar un procedimiento existente", async () => {
    render(<ProcedimientosPage />);
    await waitFor(() => {
      expect(screen.getByText("Limpieza Dental")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("edit-btn-1"));
    expect(screen.getByTestId("procedimiento-modal")).toBeInTheDocument();
    expect(screen.getByTestId("form-nombre")).toHaveValue("Limpieza Dental");
    expect(screen.getByTestId("form-duracion")).toHaveValue(30);
  });

  it("debe llamar a la API para crear un nuevo procedimiento al enviar el formulario", async () => {
    render(<ProcedimientosPage />);
    await waitFor(() => {
      expect(screen.getByText("Limpieza Dental")).toBeInTheDocument();
    });

    fireEvent.click(
      screen.getByRole("button", { name: /nuevo procedimiento/i })
    );

    const nombreInput = screen.getByTestId("form-nombre");
    const duracionInput = screen.getByTestId("form-duracion");
    const submitButton = screen.getByTestId("submit-button");

    await userEvent.clear(nombreInput);
    await userEvent.type(nombreInput, "Nuevo Procedimiento Test");
    await userEvent.clear(duracionInput);
    await userEvent.type(duracionInput, "45");

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledTimes(1);
    });
  });

  it("debe llamar a la API para eliminar un procedimiento", async () => {
    render(<ProcedimientosPage />);
    await waitFor(() => {
      expect(screen.getByText("Ortodoncia")).toBeInTheDocument();
    });

    // Encuentra el botón de eliminar del procedimiento de ortodoncia
    fireEvent.click(screen.getByTestId("delete-btn-2"));

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledTimes(1);
      expect(api.delete).toHaveBeenCalledTimes(1);
      expect(api.delete).toHaveBeenCalledWith(
        "procedimientos/2/",
        expect.any(Object)
      );
    });
  });
});
