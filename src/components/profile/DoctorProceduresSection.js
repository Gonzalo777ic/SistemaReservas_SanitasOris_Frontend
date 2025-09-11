// src/components/profile/DoctorProceduresSection.js

const DoctorProceduresSection = ({ procedimientos }) => {
  return (
    <div className="mt-4 pt-4 border-top">
      <h5 className="mb-3">Procedimientos que realiza</h5>
      <p className="text-muted">
        Esta es la lista de los procedimientos que el administrador te ha
        asignado. Si necesitas agregar o eliminar alguno, por favor,
        notifícaselo al administrador.
      </p>
      {procedimientos.length > 0 ? (
        <ul className="list-group">
          {procedimientos.map((proc) => (
            <li
              key={proc.id} // Assuming proc has a unique ID
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              {proc.nombre}
              <span className="badge bg-primary rounded-pill">
                Duración: {proc.duracion_min} min
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="alert alert-warning" role="alert">
          Actualmente no tienes procedimientos asignados.
        </div>
      )}
    </div>
  );
};

export default DoctorProceduresSection;
