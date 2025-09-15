import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import AppointmentList from "./AppointmentList";

// Importamos el componente para la prueba, pero también lo simulamos
// para asegurar que el test solo se enfoca en AppointmentList.
// Retornamos null para que la salida del mock no interfiera con el DOM.
jest.mock("./AppointmentItem", () => {
  return jest.fn(() => null);
});

// Importamos el componente simulado de AppointmentItem para poder
// hacer aserciones sobre sus llamadas.
import AppointmentItem from "./AppointmentItem";

describe("AppointmentList", () => {
  const mockAppointments = [
    { id: 1, doctor: { nombre: "Dr. Juan" }, estado: "confirmada" },
    { id: 2, doctor: { nombre: "Dra. Ana" }, estado: "pendiente" },
    { id: 3, doctor: { nombre: "Dr. Pedro" }, estado: "cancelada" },
  ];

  afterEach(() => {
    // Limpiamos los mocks después de cada prueba para evitar
    // interferencias entre ellas.
    jest.clearAllMocks();
  });

  it("should render a list of AppointmentItem components", () => {
    // Renderizamos el componente con la lista de citas simuladas.
    render(<AppointmentList appointments={mockAppointments} />);

    // Verificamos que el componente simulado de AppointmentItem
    // haya sido llamado 3 veces (una por cada cita).
    expect(AppointmentItem).toHaveBeenCalledTimes(mockAppointments.length);
  });

  it("should pass the correct 'cita' props to each AppointmentItem", () => {
    // Renderizamos el componente.
    render(<AppointmentList appointments={mockAppointments} />);

    // Verificamos las llamadas individuales para asegurar que se pasaron
    // las props correctas. La propiedad 'key' no se pasa en el objeto de props.
    const firstCall = AppointmentItem.mock.calls[0][0];
    expect(firstCall.cita).toEqual(mockAppointments[0]);

    const secondCall = AppointmentItem.mock.calls[1][0];
    expect(secondCall.cita).toEqual(mockAppointments[1]);

    const thirdCall = AppointmentItem.mock.calls[2][0];
    expect(thirdCall.cita).toEqual(mockAppointments[2]);
  });

  it("should render an empty list when no appointments are provided", () => {
    render(<AppointmentList appointments={[]} />);

    // Verificamos que el componente simulado no sea llamado.
    expect(AppointmentItem).not.toHaveBeenCalled();
  });
});
