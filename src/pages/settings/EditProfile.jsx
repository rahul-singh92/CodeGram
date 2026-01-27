import { useUser } from "../../context/UserContext";

function EditProfile() {
  const { profile } = useUser(); 
  const avatarUrl = profile?.avatar_url;

  return (
    <div className="edit-profile-wrapper">
      <h1 className="edit-profile-title">Edit Profile</h1>

      {/* Profile card */}
      <div className="edit-profile-card">
        <div className="edit-profile-avatar">
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" />
          ) : (
            <div className="avatar-placeholder" />
          )}
        </div>

        <div className="edit-profile-info">
          <p className="edit-profile-username">
            {profile?.username || "username"}
          </p>
          <p className="edit-profile-name">
            {profile?.full_name || "Full Name"}
          </p>
        </div>

        <button className="change-photo-btn">
          Change photo
        </button>
      </div>
    </div>
  );
}

export default EditProfile;
