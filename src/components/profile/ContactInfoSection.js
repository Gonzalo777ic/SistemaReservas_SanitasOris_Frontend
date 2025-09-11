// src/components/profile/ContactInfoSection.js

const ContactInfoSection = ({
  profile,
  userRole,
  isEditing,
  phoneNumber,
  setPhoneNumber,
  handleSaveProfile,
  handleCancelEdit,
  isSaving,
  setIsEditing,
}) => {
  return (
    <div className="mt-4 pt-4 border-top">
      <h5 className="mb-3">Datos de Contacto</h5>
      <div className="d-flex align-items-center justify-content-between flex-wrap">
        <div className="flex-grow-1 me-3">
          <label className="form-label text-muted">Teléfono</label>
          {isEditing && (userRole === "paciente" || userRole === "doctor") ? (
            <input
              type="tel"
              className="form-control"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          ) : (
            <p className="card-text">{profile.telefono || "No especificado"}</p>
          )}
        </div>
        <div>
          {userRole === "paciente" || userRole === "doctor" ? (
            isEditing ? (
              <div className="d-flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="btn btn-success"
                >
                  {isSaving ? "Guardando..." : "Guardar"}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="btn btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="btn btn-primary"
              >
                Editar
              </button>
            )
          ) : (
            <div
              className="alert alert-info text-center"
              role="alert"
              style={{ whiteSpace: "nowrap" }}
            >
              Modificar desde el panel de administración
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactInfoSection;
