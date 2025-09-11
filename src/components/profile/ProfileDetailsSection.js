// src/components/profile/ProfileDetailsSection.js

const ProfileDetailsSection = ({
  profile,
  userRole,
  isEditing,
  specialty,
  setSpecialty,
}) => {
  return (
    <div className="row">
      <div className="col-md-6 mb-3">
        <label className="form-label text-muted">Nombre</label>
        <p className="card-text">{profile.user.first_name || "N/A"}</p>
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label text-muted">Apellido</label>
        <p className="card-text">{profile.user.last_name || "N/A"}</p>
      </div>
      <div className="col-md-6 mb-3">
        <label className="form-label text-muted">Email</label>
        <p className="card-text">{profile.user.email}</p>
      </div>
      {userRole === "doctor" && (
        <div className="col-md-6 mb-3">
          <label className="form-label text-muted">Especialidad</label>
          {isEditing ? (
            <input
              type="text"
              className="form-control"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            />
          ) : (
            <p className="card-text">{profile.especialidad || "N/A"}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileDetailsSection;
