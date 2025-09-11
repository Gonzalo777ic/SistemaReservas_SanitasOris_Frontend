// src/components/admin/reservas/ReservasFilters.js

import { Dropdown, DropdownButton } from "react-bootstrap";

const ReservasFilters = ({ filter, setFilter }) => {
  return (
    <DropdownButton
      title={`Filtrar por: ${filter.charAt(0).toUpperCase() + filter.slice(1)}`}
      variant="outline-secondary"
    >
      <Dropdown.Item onClick={() => setFilter("pendiente")}>
        Pendiente
      </Dropdown.Item>
      <Dropdown.Item onClick={() => setFilter("confirmada")}>
        Confirmada
      </Dropdown.Item>
      <Dropdown.Item onClick={() => setFilter("cancelada")}>
        Cancelada
      </Dropdown.Item>
    </DropdownButton>
  );
};

export default ReservasFilters;
