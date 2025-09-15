import { Spinner } from "react-bootstrap";

const LoadingSpinner = ({ message = "Cargando..." }) => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
      <Spinner animation="border" role="status" variant="primary">
        <span className="visually-hidden">{message}</span>
      </Spinner>
      {/* El mensaje es solo para lectores de pantalla. Si deseas un mensaje visible,
          es mejor usar una estructura diferente o una clase de visibilidad.
          Para este caso, el mensaje solo se encuentra en el span. */}
    </div>
  );
};

export default LoadingSpinner;
