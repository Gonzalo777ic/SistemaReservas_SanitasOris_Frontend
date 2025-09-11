// src/components/paciente/historial/AppointmentList.js

import { ListGroup } from "react-bootstrap";
import AppointmentItem from "./AppointmentItem";

const AppointmentList = ({ appointments }) => {
  return (
    <div className="mt-4">
      <ListGroup>
        {appointments.map((cita) => (
          <AppointmentItem key={cita.id} cita={cita} />
        ))}
      </ListGroup>
    </div>
  );
};

export default AppointmentList;
