// src/components/profile/ProfileInfoCard.js

import ContactInfoSection from "./ContactInfoSection";
import DoctorProceduresSection from "./DoctorProceduresSection";
import ProfileDetailsSection from "./ProfileDetailsSection";

const ProfileInfoCard = ({
  user,
  profile,
  userRole,
  isEditing,
  phoneNumber,
  setPhoneNumber,
  specialty,
  setSpecialty,
  handleSaveProfile,
  handleCancelEdit,
  isSaving,
  setMessage,
  message,
  procedimientos,
  setIsEditing,
}) => {
  return (
    <div className="card shadow-lg border-0">
      <div className="card-body p-4">
        <div className="row g-0">
          <div className="col-md-4 d-flex flex-column align-items-center justify-content-center p-3 text-center border-end">
            <div className="profile-img-container mb-3">
              <img
                src={
                  user?.picture ||
                  "https://placehold.co/150x150/007bff/ffffff?text=User"
                }
                className="rounded-circle border border-5 border-primary shadow"
                alt="Foto de perfil"
                style={{ width: "150px", height: "150px" }}
              />
            </div>
            <h4 className="card-title fw-bold mb-1">
              {profile.user.first_name || "Usuario"}{" "}
              {profile.user.last_name || ""}
            </h4>
            <p className="text-muted text-capitalize mb-0">{userRole}</p>
          </div>
          <div className="col-md-8 p-4">
            <h5 className="mb-3 border-bottom pb-2">Información del Perfil</h5>
            {message.text && (
              <div
                className={`alert text-center ${
                  message.type === "success" ? "alert-success" : "alert-danger"
                }`}
                role="alert"
              >
                {message.text}
              </div>
            )}

            <ProfileDetailsSection
              profile={profile}
              userRole={userRole}
              isEditing={isEditing}
              specialty={specialty}
              setSpecialty={setSpecialty}
            />

            <ContactInfoSection
              profile={profile}
              userRole={userRole}
              isEditing={isEditing}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              handleSaveProfile={handleSaveProfile}
              handleCancelEdit={handleCancelEdit}
              isSaving={isSaving}
              setIsEditing={setIsEditing}
            />

            {userRole === "doctor" && (
              <DoctorProceduresSection procedimientos={procedimientos} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileInfoCard;
