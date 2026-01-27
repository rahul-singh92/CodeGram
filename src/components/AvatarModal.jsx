function AvatarModal({
    open,
    onClose,
    onUpload,
    onRemove,
    hasAvatar,
}) {
    if (!open) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="photo-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-item header">Change Profile Photo</div>

                <div className="modal-divider" />

                <div
                    className="modal-item action upload"
                    onClick={() => {
                        const input = document.getElementById("avatarInput");
                        input.click();
                    }}
                >
                    Upload Photo
                </div>

                {hasAvatar && (
                    <>
                        <div className="modal-divider" />
                        <div className="modal-item action remove" onClick={async () => {
                            await onRemove();       
                            onClose();              
                        }}>
                            Remove Current Photo
                        </div>
                    </>
                )}

                <div className="modal-divider" />
                <div className="modal-item cancel" onClick={onClose}>
                    Cancel
                </div>

                <input
                    id="avatarInput"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={async (e) => {
                        await onUpload(e.target.files[0]);
                        onClose();          
                    }}
                />
            </div>
        </div>
    );
}

export default AvatarModal;
