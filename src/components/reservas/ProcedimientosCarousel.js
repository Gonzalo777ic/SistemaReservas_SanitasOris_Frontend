import PropTypes from "prop-types";
import { useState } from "react";
import { Button, Card, Carousel } from "react-bootstrap";

const ProcedimientosCarousel = ({ procedimientos, onSelect }) => {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
    onSelect(procedimientos[selectedIndex]);
  };

  if (!procedimientos || procedimientos.length === 0) {
    return <p>No hay procedimientos disponibles.</p>;
  }

  return (
    <>
      <style>
        {`
                .carousel-item-img {
                    height: 200px;
                    object-fit: contain;
                }
                .carousel-item {
                    text-align: center;
                }
                .carousel-control-prev-icon, .carousel-control-next-icon {
                    background-color: #333;
                    border-radius: 50%;
                }
                `}
      </style>
      <Carousel activeIndex={index} onSelect={handleSelect} interval={null}>
        {procedimientos.map((p, idx) => (
          <Carousel.Item key={p.id}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <img
                  className="d-block w-100 carousel-item-img mb-3"
                  src={
                    p.imagen ||
                    "https://via.placeholder.com/200?text=Sin+Imagen"
                  }
                  alt={p.nombre}
                />
                <Card.Title>{p.nombre}</Card.Title>
                <Card.Text>{p.descripcion}</Card.Text>
                <Card.Text>
                  <small className="text-muted">{p.duracion_min} min</small>
                </Card.Text>
                <Button
                  variant={index === idx ? "primary" : "outline-primary"}
                  onClick={() => handleSelect(idx)}
                >
                  {index === idx ? "Seleccionado" : "Seleccionar"}
                </Button>
              </Card.Body>
            </Card>
          </Carousel.Item>
        ))}
      </Carousel>
    </>
  );
};

ProcedimientosCarousel.propTypes = {
  procedimientos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      nombre: PropTypes.string.isRequired,
      descripcion: PropTypes.string,
      duracion_min: PropTypes.number,
      activo: PropTypes.bool,
      imagen: PropTypes.string,
    })
  ).isRequired,
  onSelect: PropTypes.func.isRequired,
};

export default ProcedimientosCarousel;
