import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useUser } from "../../context/UserContext";

function AccountPrivacy() {
  const { profile, setProfile } = useUser();

  const [privateAccount, setPrivateAccount] = useState(
    profile?.is_private ?? false
  );

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = "Account privacy • CodeGram";
  }, []);

  // Sync state when profile loads
  useEffect(() => {
    if (profile) {
      setPrivateAccount(profile.is_private ?? false);
    }
  }, [profile]);

  // Update Supabase helper
  const updateSetting = async (field, value) => {
    if (!profile?.id) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from("profiles")
        .update({ [field]: value })
        .eq("id", profile.id);

      if (error) throw error;

      // update global context profile
      setProfile((prev) => ({
        ...prev,
        [field]: value,
      }));
    } catch (err) {
      console.error("Failed to update privacy setting:", err);
      alert("Failed to update privacy setting");
    } finally {
      setSaving(false);
    }
  };

  const handlePrivateToggle = () => {
    const newValue = !privateAccount;
    setPrivateAccount(newValue);
    updateSetting("is_private", newValue);
  };

  return (
    <div className="notifications-wrapper">
      <h1 className="notifications-title">Account privacy</h1>

      <div className="notifications-box">
        {/* Private Account */}
        <div className="notification-row">
          <div>
            <p className="notification-label">Private Account</p>
            <p className="notification-subtext">
              Control who can see your profile and posts.
            </p>
          </div>

          <div
            className={`toggle-switch ${privateAccount ? "on" : ""} ${
              saving ? "disabled" : ""
            }`}
            onClick={!saving ? handlePrivateToggle : undefined}
          >
            <div className="toggle-circle"></div>
          </div>
        </div>
      </div>

      {/* Info Text */}
      <div className="privacy-info-text">
        <p>
          When your account is public, your profile and posts can be seen by
          anyone, on or off CodeGram, even if they don't have a CodeGram account.
        </p>

        <p>
          When your account is private, only the followers you approve can see
          what you share, including your photos or videos on hashtag and
          location pages, and your followers and following lists. Certain info
          on your profile, like your profile picture and username, is visible to
          everyone on and off CodeGram.
        </p>
      </div>
    </div>
  );
}

export default AccountPrivacy;
