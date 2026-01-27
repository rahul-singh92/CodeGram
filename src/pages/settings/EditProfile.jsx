import { useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import AvatarModal from "../../components/AvatarModal";
import { useAvatarUpload } from "../../hooks/useAvatarUpload";
import { supabase } from "../../lib/supabase";

function EditProfile() {
  const { profile, setProfile } = useUser();

  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const [bio, setBio] = useState(profile?.bio || "");
  const [initialBio, setInitialBio] = useState(profile?.bio || "");
  const [saving, setSaving] = useState(false);

  const { uploadAvatar, removeAvatar } = useAvatarUpload(
    profile,
    setAvatarUrl,
    setAvatarLoading
  );

  const hasBioChanged = bio !== initialBio;

  /* keep state in sync if profile loads late */
  useEffect(() => {
    if (profile) {
      setBio(profile.bio || "");
      setInitialBio(profile.bio || "");
      setAvatarUrl(profile.avatar_url);
    }
  }, [profile]);

  const handleSubmit = async () => {
    if (!hasBioChanged) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from("profiles")
        .update({ bio })
        .eq("id", profile.id);

      if (error) throw error;

      /* update context so app reflects change */
      setProfile((prev) => ({ ...prev, bio }));
      setInitialBio(bio);
    } catch (err) {
      console.error(err);
      alert("Failed to update bio");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="edit-profile-wrapper">
      <h1 className="edit-profile-title">Edit Profile</h1>

      {/* PROFILE CARD */}
      <div className="edit-profile-card">
        {/* AVATAR */}
        <div
          className={`edit-profile-avatar clickable ${
            avatarLoading ? "loading" : ""
          }`}
          onClick={() => !avatarLoading && setShowPhotoModal(true)}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt="Profile" />
          ) : (
            <div className="avatar-placeholder" />
          )}
        </div>

        {/* INFO */}
        <div className="edit-profile-info">
          <p className="edit-profile-username">{profile?.username}</p>
          <p className="edit-profile-name">{profile?.full_name}</p>
        </div>

        {/* CHANGE PHOTO */}
        <button
          className="change-photo-btn"
          onClick={() => setShowPhotoModal(true)}
          disabled={avatarLoading}
        >
          Change photo
        </button>
      </div>

      {/* BIO SECTION */}
      <div className="edit-profile-bio">
        <label className="edit-profile-bio-label">Bio</label>

        <div className="bio-textarea-wrapper">
          <textarea
            className="bio-textarea"
            maxLength={150}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Bio"
          />

          <div className="bio-counter">
            {bio.length} / 150
          </div>
        </div>
      </div>

      {/* SUBMIT */}
      <div className="submit-profile-row">
      <button
        className={`submit-profile-btn ${hasBioChanged ? "active" : ""}`}
        onClick={handleSubmit}
        disabled={!hasBioChanged || saving}
      >
        {saving ? "Saving…" : "Submit"}
      </button>
      </div>

      {/* AVATAR MODAL */}
      <AvatarModal
        open={showPhotoModal}
        onClose={() => setShowPhotoModal(false)}
        onUpload={uploadAvatar}
        onRemove={removeAvatar}
        hasAvatar={!!avatarUrl}
      />
    </div>
  );
}

export default EditProfile;
