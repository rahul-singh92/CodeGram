import { useRef, useEffect, useState } from "react";
import { useUser } from "../../context/UserContext";
import AvatarModal from "../../components/AvatarModal";
import { useAvatarUpload } from "../../hooks/useAvatarUpload";
import { supabase } from "../../lib/supabase";
import { ChevronDown } from "lucide-react";

function EditProfile() {
  const { profile, setProfile } = useUser();

  /* ---------- AVATAR ---------- */
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  /* ---------- BIO ---------- */
  const [bio, setBio] = useState(profile?.bio || "");
  const [initialBio, setInitialBio] = useState(profile?.bio || "");

  /* ---------- GENDER ---------- */
  const [gender, setGender] = useState(profile?.gender || "");
  const [initialGender, setInitialGender] = useState(profile?.gender || "");
  const [genderOpen, setGenderOpen] = useState(false);
  const genderRef = useRef(null);


  /* ---------- SAVE STATE ---------- */
  const [saving, setSaving] = useState(false);

  const { uploadAvatar, removeAvatar } = useAvatarUpload(
    profile,
    setAvatarUrl,
    setAvatarLoading
  );

  /* ---------- CHANGE CHECKS ---------- */
  const hasBioChanged = bio !== initialBio;
  const hasGenderChanged = gender !== initialGender;
  const hasProfileChanged = hasBioChanged || hasGenderChanged;

  /* ---------- SYNC WHEN PROFILE LOADS ---------- */
  useEffect(() => {
    if (profile) {
      setAvatarUrl(profile.avatar_url);
      setBio(profile.bio || "");
      setInitialBio(profile.bio || "");
      setGender(profile.gender || "");
      setInitialGender(profile.gender || "");
    }
  }, [profile]);

  /* ---------- SUBMIT ---------- */
  const handleSubmit = async () => {
    if (!hasProfileChanged) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from("profiles")
        .update({
          bio,
          gender,
        })
        .eq("id", profile.id);

      if (error) throw error;

      /* update context so UI updates everywhere */
      setProfile((prev) => ({
        ...prev,
        bio,
        gender,
      }));

      setInitialBio(bio);
      setInitialGender(gender);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    document.title = "Edit Profile • CodeGram";
    const handleClickOutside = (e) => {
      if (
        genderRef.current &&
        !genderRef.current.contains(e.target)
      ) {
        setGenderOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);




  return (
    <div className="edit-profile-wrapper">
      <h1 className="edit-profile-title">Edit Profile</h1>

      {/* ================= PROFILE CARD ================= */}
      <div className="edit-profile-card">
        {/* AVATAR */}
        <div
          className={`edit-profile-avatar clickable ${avatarLoading ? "loading" : ""
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

      {/* ================= BIO ================= */}
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
          <div className="bio-counter">{bio.length} / 150</div>
        </div>
      </div>

      {/* ================= GENDER ================= */}
      <div className="edit-profile-gender" ref={genderRef}>
        <label className="edit-profile-bio-label">Gender</label>

        {/* BUTTON */}
        <div
          className={`gender-dropdown ${genderOpen ? "open" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            setGenderOpen(true);
          }}
        >
          <span className="gender-value">
            {gender || "Select gender"}
          </span>

          <ChevronDown
            size={18}
            className={`gender-chevron ${genderOpen ? "open" : ""}`}
          />
        </div>

        {/* OPTIONS */}
        {genderOpen && (
          <div className="gender-options">
            {["Female", "Male", "Prefer not to say"].map((option) => (
              <div
                key={option}
                className="gender-option"
                onClick={(e) => {
                  e.stopPropagation();   // 🔥 CRITICAL
                  setGender(option);
                  setGenderOpen(false);
                }}
              >
                <span>{option}</span>

                <span
                  className={`gender-check ${gender === option ? "checked" : ""
                    }`}
                >
                  {gender === option && "✓"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <p className="gender-helper-text">
  This won't be part of your public profile.
</p>

<p className="profile-visibility-text">
  Certain profile info, such as your name and bio, is visible to everyone.
</p>



      {/* ================= SUBMIT ================= */}
      <div className="submit-profile-row">
        <button
          className={`submit-profile-btn ${hasProfileChanged ? "active" : ""}`}
          onClick={handleSubmit}
          disabled={!hasProfileChanged || saving}
        >
          {saving ? "Saving…" : "Submit"}
        </button>
      </div>

      {/* ================= AVATAR MODAL ================= */}
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
