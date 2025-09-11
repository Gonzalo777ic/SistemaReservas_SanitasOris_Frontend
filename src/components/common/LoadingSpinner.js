// src/components/common/LoadingSpinner.js

const LoadingSpinner = ({ message = "Cargando..." }) => {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">{message}</span>
      </div>
      {message && <p className="ms-2 text-primary">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;
