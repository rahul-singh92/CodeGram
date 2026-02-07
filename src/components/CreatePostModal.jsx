import { X, ArrowLeft } from "lucide-react";
import { ReelsIcon } from "./icons/AppIcons";
import { useRef, useState } from "react";

function CreatePostModal({ open, onClose }) {
    const fileInputRef = useRef(null);

    const [selectedImage, setSelectedImage] = useState(null);
    const [showCropBox, setShowCropBox] = useState(false);
    const [showDiscardBox, setShowDiscardBox] = useState(false);
    //drag states
    const [dragging, setDragging] = useState(false);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [start, setStart] = useState({ x: 0, y: 0 });
    //Crop Options Seldction 
    const [showCropOptions, setShowCropOptions] = useState(false);
    const [aspectRatio, setAspectRatio] = useState("original");
    //Zoom State
    const [zoom, setZoom] = useState(1.2);
const [showZoomSlider, setShowZoomSlider] = useState(false);


    if (!open) return null;

    const CropSelectIcon = ({ size = 18 }) => (
        <svg
            aria-label="Select crop"
            fill="currentColor"
            height={size}
            role="img"
            viewBox="0 0 24 24"
            width={size}
        >
            <title>Select crop</title>
            <path d="M10 20H4v-6a1 1 0 0 0-2 0v7a1 1 0 0 0 1 1h7a1 1 0 0 0 0-2ZM20.999 2H14a1 1 0 0 0 0 2h5.999v6a1 1 0 0 0 2 0V3a1 1 0 0 0-1-1Z"></path>
        </svg>
    );
    const ZoomIcon = ({ size = 18 }) => (
        <svg
            aria-label="Select zoom"
            fill="currentColor"
            height={size}
            role="img"
            viewBox="0 0 24 24"
            width={size}
        >
            <title>Select zoom</title>
            <path d="m22.707 21.293-4.825-4.825a9.519 9.519 0 1 0-1.414 1.414l4.825 4.825a1 1 0 0 0 1.414-1.414ZM10.5 18.001a7.5 7.5 0 1 1 7.5-7.5 7.509 7.509 0 0 1-7.5 7.5Zm3.5-8.5h-2.5v-2.5a1 1 0 1 0-2 0v2.5H7a1 1 0 1 0 0 2h2.5v2.5a1 1 0 0 0 2 0v-2.5H14a1 1 0 0 0 0-2Z"></path>
        </svg>
    );

    // ---------- HANDLE FILE PICK ----------
    const handleFilePick = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setSelectedImage(url);
        setShowCropBox(true);
    };

    // ---------- OPEN FILE PICKER ----------
    const openFilePicker = () => {
        fileInputRef.current.click();
    };

    // ---------- DROP IMAGE ----------
    const handleDrop = (e) => {
        e.preventDefault();

        const file = e.dataTransfer.files[0];
        if (!file) return;

        const url = URL.createObjectURL(file);
        setSelectedImage(url);
        setShowCropBox(true);
    };

    // ---------- DRAG IMAGE ----------
    const handleMouseDown = (e) => {
        setDragging(true);
        setStart({ x: e.clientX - pos.x, y: e.clientY - pos.y });
    };

    const handleMouseMove = (e) => {
        if (!dragging) return;

        const newX = e.clientX - start.x;
        const newY = e.clientY - start.y;

        // clamp values so it doesn't leave border
        const clampX = Math.max(-120, Math.min(120, newX));
        const clampY = Math.max(-120, Math.min(120, newY));

        setPos({ x: clampX, y: clampY });
    };

    const handleMouseUp = () => {
        setDragging(false);
    };

    // ---------- CLOSE EVERYTHING ----------
    const resetAll = () => {
        setSelectedImage(null);
        setShowCropBox(false);
        setShowDiscardBox(false);
        setPos({ x: 0, y: 0 });
    };

    return (
        <>
            {/* Overlay */}
            <div className="createpost-overlay" onClick={() => setShowDiscardBox(true)}></div>

            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFilePick}
            />

            {/* =======================
          CREATE MODAL
      ======================= */}
            {!showCropBox && (
                <div
                    className="createpost-modal"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    {/* Header */}
                    <div className="createpost-header">
                        <h2>Create new post</h2>

                        <button className="createpost-close-btn" onClick={onClose}>
                            <X size={20} strokeWidth={1.5} />
                        </button>
                    </div>

                    <div className="createpost-divider"></div>

                    {/* Content */}
                    <div className="createpost-content">
                        <div className="createpost-icon">
                            <ReelsIcon size={70} />
                        </div>
                        <p className="createpost-text">Drag photos here</p>

                        <button className="createpost-btn" onClick={openFilePicker}>
                            Select from computer
                        </button>
                    </div>
                </div>
            )}

            {/* =======================
          CROP MODAL
      ======================= */}
            {showCropBox && (
                <div className="crop-modal">
                    {/* Header */}
                    <div className="crop-header">
                        <button
                            className="crop-back-btn"
                            onClick={() => setShowDiscardBox(true)}
                        >
                            <ArrowLeft size={20} strokeWidth={1.5} />
                        </button>

                        <h2>Crop</h2>
                    </div>

                    <div className="createpost-divider"></div>

                    {/* Crop Box */}
                    <div
                        className="crop-box"
                    >
                        <div
                            className={`crop-frame ${aspectRatio}`}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                        >
                            <img
                                src={selectedImage}
                                alt="Selected"
                                draggable={false}
                                className="crop-image"
                                style={{
                                    transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(${zoom})`,
                                    cursor: dragging ? "grabbing" : "grab",
                                }}
                            />
                        </div>


                        <div className="crop-controls">
  {/* Crop Options */}
  <div className="crop-options-wrapper">
    <button
      className="crop-options-btn"
      onClick={(e) => {
        e.stopPropagation();
        setShowCropOptions(!showCropOptions);
        setShowZoomSlider(false);
      }}
    >
      <CropSelectIcon />
    </button>

    {showCropOptions && (
      <div className="crop-options-menu">
        <div
          className="crop-option"
          onClick={() => {
            setAspectRatio("original");
            setShowCropOptions(false);
          }}
        >
          Original
        </div>

        <div
          className="crop-option"
          onClick={() => {
            setAspectRatio("square");
            setShowCropOptions(false);
          }}
        >
          1:1
        </div>

        <div
          className="crop-option"
          onClick={() => {
            setAspectRatio("portrait");
            setShowCropOptions(false);
          }}
        >
          4:5
        </div>

        <div
          className="crop-option"
          onClick={() => {
            setAspectRatio("landscape");
            setShowCropOptions(false);
          }}
        >
          16:9
        </div>
      </div>
    )}
  </div>

  {/* Zoom */}
  <div className="zoom-wrapper">
    <button
      className="crop-options-btn"
      onClick={(e) => {
        e.stopPropagation();
        setShowZoomSlider(!showZoomSlider);
        setShowCropOptions(false);
      }}
    >
      <ZoomIcon />
    </button>

    {showZoomSlider && (
      <div className="zoom-slider-box">
        <input
          type="range"
          min="0.8"
          max="2"
          step="0.05"
          value={zoom}
          onChange={(e) => setZoom(parseFloat(e.target.value))}
          className="zoom-slider"
        />
      </div>
    )}
  </div>
</div>

                    </div>
                </div>
            )}

            {/* =======================
          DISCARD MODAL
      ======================= */}
            {showDiscardBox && (
                <div className="discard-modal">
                    <div className="discard-box">
                        <h3 className="discard-title">Discard post?</h3>

                        <p className="discard-subtitle">
                            If you leave, your edits won’t be saved.
                        </p>

                        <div className="discard-divider"></div>

                        <div
                            className="discard-action discard-red"
                            onClick={() => {
                                resetAll();
                                onClose();
                            }}
                        >
                            Discard
                        </div>

                        <div className="discard-divider"></div>

                        <div
                            className="discard-action"
                            onClick={() => setShowDiscardBox(false)}
                        >
                            Cancel
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default CreatePostModal;