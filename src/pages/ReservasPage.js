import { useEffect, useState } from "react";
import { getReservas } from "../services/reservas";

const ReservasPage = () => {
  const [reservas, setReservas] = useState([]);

  useEffect(() => {
    getReservas().then(setReservas).catch(console.error);
  }, []);

  return (
    <div>
      <h1>Mis Reservas</h1>
      <ul>
        {reservas.map((r) => (
          <li key={r.id}>
            {r.paciente.nombre} con {r.doctor.nombre} el {r.fecha_hora}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReservasPage;
