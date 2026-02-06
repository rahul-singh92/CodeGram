import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { useUser } from "../../context/UserContext";

function Notifications() {
  const { profile, setProfile } = useUser();

  const [pushNotifications, setPushNotifications] = useState(
    profile?.push_notifications ?? true
  );
  const [emailNotifications, setEmailNotifications] = useState(
    profile?.email_notifications ?? false
  );

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = "Notifications • CodeGram";
  }, []);

  // Sync state when profile loads
  useEffect(() => {
    if (profile) {
      setPushNotifications(profile.push_notifications ?? true);
      setEmailNotifications(profile.email_notifications ?? false);
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
      console.error("Failed to update notification setting:", err);
      alert("Failed to update notification settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePushToggle = () => {
    const newValue = !pushNotifications;
    setPushNotifications(newValue);
    updateSetting("push_notifications", newValue);
  };

  const handleEmailToggle = () => {
    const newValue = !emailNotifications;
    setEmailNotifications(newValue);
    updateSetting("email_notifications", newValue);
  };

  return (
    <div className="notifications-wrapper">
      <h1 className="notifications-title">Notifications</h1>

      <div className="notifications-box">
        {/* Push Notifications */}
        <div className="notification-row">
          <div>
            <p className="notification-label">Push Notifications</p>
            <p className="notification-subtext">
              Get notified about likes, comments, and follows.
            </p>
          </div>

          <div
            className={`toggle-switch ${pushNotifications ? "on" : ""} ${
              saving ? "disabled" : ""
            }`}
            onClick={!saving ? handlePushToggle : undefined}
          >
            <div className="toggle-circle"></div>
          </div>
        </div>

        <div className="notification-divider"></div>

        {/* Email Notifications */}
        <div className="notification-row">
          <div>
            <p className="notification-label">Email Notifications</p>
            <p className="notification-subtext">
              Receive updates and alerts through email.
            </p>
          </div>

          <div
            className={`toggle-switch ${emailNotifications ? "on" : ""} ${
              saving ? "disabled" : ""
            }`}
            onClick={!saving ? handleEmailToggle : undefined}
          >
            <div className="toggle-circle"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notifications;
