import { render, screen } from "@testing-library/react";
import CitasModals from "./CitasModals";

// Mock del componente AddNotesModal de forma robusta y simple
jest.mock("../AddNotesModal", () => {
  return jest.fn((props) => {
    if (!props.show) {
      return null;
    }
    return <div data-testid="add-notes-modal">Mock AddNotesModal</div>;
  });
});

const mockReserva = {
  id: 1,
  paciente: { user: { first_name: "Ana", last_name: "García" } },
  procedimiento: { nombre: "Revisión general" },
  fecha_hora: "2025-10-23T15:30:00Z",
  estado: "pendiente",
  notas_doctor: "Revisión completa de la dentadura.",
};

describe("CitasModals", () => {
  const mockSetShowDetailsModal = jest.fn();
  const mockSetShowNotesModal = jest.fn();
  const mockSetShowConfirmModal = jest.fn();
  const mockSetShowCancelModal = jest.fn();
  const mockHandleUpdateStatus = jest.fn();
  const mockOnNotesAdded = jest.fn();
  const mockGetAccessTokenSilently = jest.fn(() => "mock-token-123");

  const defaultProps = {
    selectedReserva: mockReserva,
    handleUpdateStatus: mockHandleUpdateStatus,
    onNotesAdded: mockOnNotesAdded,
    getAccessTokenSilently: mockGetAccessTokenSilently,
    showDetailsModal: false,
    showConfirmModal: false,
    showCancelModal: false,
    showNotesModal: false,
  };

  it("should render confirm modal and handle button clicks", () => {
    render(
      <CitasModals
        {...defaultProps}
        showConfirmModal={true}
        setShowConfirmModal={mockSetShowConfirmModal}
      />
    );
    expect(screen.getByText("Confirmar Cita")).toBeInTheDocument();
  });

  it("should render cancel modal and handle button clicks", () => {
    render(
      <CitasModals
        {...defaultProps}
        showCancelModal={true}
        setShowCancelModal={mockSetShowCancelModal}
      />
    );
    expect(screen.getByText("Cancelar Cita")).toBeInTheDocument();
  });

  it("should render details modal with correct reservation data", () => {
    render(
      <CitasModals
        {...defaultProps}
        showDetailsModal={true}
        setShowDetailsModal={mockSetShowDetailsModal}
      />
    );
    expect(screen.getByText("Detalles de la Cita")).toBeInTheDocument();
  });
});
