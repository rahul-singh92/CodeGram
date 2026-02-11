import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserCircle } from "@fortawesome/free-regular-svg-icons";
import { faCalendar, faLocationDot } from "@fortawesome/free-solid-svg-icons";
import { useUser } from "../context/UserContext";

function AboutAccountModal({ open, onClose, profile, avatarUrl }) {
  const { user } = useUser();
  const isMyAccount = user?.id === profile?.id;

  if (!open) return null;

  const formatMonthYear = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="photo-modal account-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="modal-item header">About your account</div>

        <div className="modal-divider"></div>

        {/* PROFILE */}
        <div className="account-profile">
          <div className="account-avatar">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" />
            ) : (
              <FontAwesomeIcon icon={faUserCircle} />
            )}
          </div>

          <div className="account-username">{profile.username}</div>
        </div>

        {/* DESCRIPTION */}
        <div className="account-desc">
          {isMyAccount
            ? `To help keep our community authentic, we're showing information about
      accounts on CodeGram. People can see this by tapping on the ••• on your
      profile and choosing About this account.`
            : `To help keep our community authentic, we’re showing information about accounts on CodeGram.`}
        </div>


        {/* DATE JOINED */}
        <div className="account-row">
          <FontAwesomeIcon icon={faCalendar} />
          <div>
            <div className="account-title">Date Joined</div>
            <div className="account-sub">
              {formatMonthYear(profile.created_at)}
            </div>
          </div>
        </div>

        {/* LOCATION */}
        <div className="account-row">
          <FontAwesomeIcon icon={faLocationDot} />
          <div>
            <div className="account-title">Account based in</div>
            <div className="account-sub">{profile.country || "Unknown"}</div>
          </div>
        </div>

        <div className="modal-divider"></div>

        {/* CLOSE */}
        <div className="modal-item cancel" onClick={onClose}>
          Close
        </div>
      </div>
    </div>
  );
}

export default AboutAccountModal;
