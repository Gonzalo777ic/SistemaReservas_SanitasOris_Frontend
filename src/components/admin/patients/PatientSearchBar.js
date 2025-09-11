// src/components/admin/patients/PatientSearchBar.js

import { Button, Form, InputGroup } from "react-bootstrap";
import { MdSearch } from "react-icons/md";

const PatientSearchBar = ({ searchTerm, setSearchTerm }) => {
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="mb-3">
      <InputGroup>
        <Form.Control
          placeholder="Buscar pacientes por nombre, apellido o email..."
          onChange={handleSearchChange}
          value={searchTerm}
        />
        <Button variant="outline-secondary">
          <MdSearch />
        </Button>
      </InputGroup>
    </div>
  );
};

export default PatientSearchBar;
