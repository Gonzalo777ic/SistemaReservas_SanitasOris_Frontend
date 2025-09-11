// src/components/common/ErrorMessage.js

const ErrorMessage = ({ message = "Ha ocurrido un error inesperado." }) => {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="alert alert-danger" role="alert">
        {message}
      </div>
    </div>
  );
};

export default ErrorMessage;
