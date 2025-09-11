import PropTypes from "prop-types";
import { useState } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";

const DoctoresList = ({ doctores, onSelect }) => {
  const [doctorSeleccionadoId, setDoctorSeleccionadoId] = useState(null);

  const handleSelectDoctor = (doctor) => {
    setDoctorSeleccionadoId(doctor.id);
    onSelect(doctor);
  };

  if (!doctores || doctores.length === 0) {
    return <p>No hay doctores disponibles.</p>;
  }

  return (
    <div className="mb-4">
      <h4 className="mb-3">Selecciona un Doctor</h4>
      <Row xs={1} md={2} lg={3} className="g-4">
        {doctores.map((doctor) => (
          <Col key={doctor.id}>
            <Card
              className={`h-100 shadow-sm ${
                doctorSeleccionadoId === doctor.id ? "border-primary" : ""
              }`}
              style={{
                borderWidth: "2px",
                transition: "transform 0.2s",
                transform:
                  doctorSeleccionadoId === doctor.id
                    ? "scale(1.03)"
                    : "scale(1)",
              }}
            >
              <Card.Body className="d-flex flex-column">
                <Card.Title className="text-primary fw-bold">
                  {doctor.user.first_name} {doctor.user.last_name}
                </Card.Title>
                <Card.Subtitle className="mb-2 text-muted">
                  {doctor.especialidad}
                </Card.Subtitle>
                <Card.Text className="text-truncate">
                  Teléfono: {doctor.telefono}
                </Card.Text>
                <Button
                  variant={
                    doctorSeleccionadoId === doctor.id
                      ? "primary"
                      : "outline-primary"
                  }
                  className="mt-auto"
                  onClick={() => handleSelectDoctor(doctor)}
                >
                  {doctorSeleccionadoId === doctor.id
                    ? "Seleccionado"
                    : "Seleccionar"}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

DoctoresList.propTypes = {
  doctores: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      user: PropTypes.shape({
        first_name: PropTypes.string.isRequired,
        last_name: PropTypes.string.isRequired,
      }).isRequired,
      especialidad: PropTypes.string.isRequired,
      telefono: PropTypes.string,
    })
  ).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default DoctoresList;
