import { X, ArrowLeft, SmileIcon } from "lucide-react";
import { ReelsIcon } from "./icons/AppIcons";
import { useRef, useState } from "react";
import { useUser } from "../context/UserContext";
import { supabase } from "../lib/supabase";

function CreatePostModal({ open, onClose }) {
    const fileInputRef = useRef(null);
    const { user, profile } = useUser();

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
    const [zoom, setZoom] = useState(1);
    const [showZoomSlider, setShowZoomSlider] = useState(false);
    //Multiple image select
    const [images, setImages] = useState([]); // {id, file, url}
    const [activeIndex, setActiveIndex] = useState(0);
    const [showGallery, setShowGallery] = useState(false);
    const [draggedIndex, setDraggedIndex] = useState(null);
    //delete photo state
    const [showDeletePhotoBox, setShowDeletePhotoBox] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);
    //Next button
    const [showEditBox, setShowEditBox] = useState(false);
    const [activeTab, setActiveTab] = useState("filters");
    const [imageEdits, setImageEdits] = useState({});
    //Caption modal
    const [showCaptionBox, setShowCaptionBox] = useState(false);
    const [caption, setCaption] = useState("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
    const [hideLikeCounts, setHideLikeCounts] = useState(false);
    const [turnOffCommenting, setTurnOffCommenting] = useState(false);
    const [isSharing, setIsSharing] = useState(false);



    if (!open) return null;

    const getCurrentEdit = () => {
        const id = images[activeIndex]?.id;
        if (!id) return null;

        return (
            imageEdits[id] || {
                filter: "Original",
                brightness: 0,
                contrast: 0,
                fade: 0,
                saturation: 0,
                temperature: 0,
                vignette: 0,
                crop: {
                    zoom: 1,
                    x: 0,
                    y: 0,
                    aspect: "original",
                },
            }
        );
    };


    const updateEdit = (field, value) => {
        const id = images[activeIndex]?.id;
        if (!id) return;

        setImageEdits((prev) => ({
            ...prev,
            [id]: {
                ...getCurrentEdit(),
                [field]: value,
            },
        }));
    };



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

    const getFilterStyle = (edit) => {
        let baseFilter = "";

        switch (edit.filter) {
            case "Aden":
                baseFilter = "contrast(0.9) saturate(1.2) brightness(1.1)";
                break;
            case "Clarendon":
                baseFilter = "contrast(1.2) saturate(1.35)";
                break;
            case "Crema":
                baseFilter = "contrast(0.9) saturate(1.1) brightness(1.05)";
                break;
            case "Gingham":
                baseFilter = "contrast(0.95) saturate(0.9) brightness(1.05)";
                break;
            case "Juno":
                baseFilter = "contrast(1.15) saturate(1.3)";
                break;
            case "Lark":
                baseFilter = "contrast(1.05) saturate(1.2) brightness(1.05)";
                break;
            case "Ludwig":
                baseFilter = "contrast(1.1) saturate(1.15)";
                break;
            case "Moon":
                baseFilter = "grayscale(0.8) contrast(1.1) brightness(1.05)";
                break;
            case "Perpetua":
                baseFilter = "contrast(1.05) saturate(1.1)";
                break;
            case "Reyes":
                baseFilter = "contrast(0.9) saturate(0.85) brightness(1.1)";
                break;
            case "Slumber":
                baseFilter = "contrast(0.9) saturate(0.8) brightness(1.05)";
                break;
            case "Original":
            default:
                baseFilter = "";
                break;
        }

        const brightness = 1 + edit.brightness / 100;
        const contrast = 1 + edit.contrast / 100;
        const saturation = 1 + edit.saturation / 100;
        const fade = edit.fade / 100;
        const temperature = edit.temperature / 100;

        // Build filter string - only add base filter if it exists
        const filterParts = [];
        if (baseFilter) filterParts.push(baseFilter);
        filterParts.push(`brightness(${brightness})`);
        filterParts.push(`contrast(${contrast})`);
        filterParts.push(`saturate(${saturation})`);

        return {
            filter: filterParts.join(' '),
            opacity: 1 - fade * 0.3,
            transform: `scale(${1})`,
            backgroundColor: temperature > 0 ? `rgba(255, 140, 0, ${temperature * 0.08})` : "",
        };
    };

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

    // Handle multiple file picker
    const handleAddImages = (files) => {
        const newFiles = Array.from(files).map((file) => ({
            id: crypto.randomUUID(),
            file,
            url: URL.createObjectURL(file),
        }));

        setImages((prev) => {
            const updated = [...prev, ...newFiles];
            if (prev.length === 0) setActiveIndex(0);
            return updated;
        });

        setImageEdits((prev) => {
            const updatedEdits = { ...prev };

            newFiles.forEach((img) => {
                updatedEdits[img.id] = {
                    filter: "Original",
                    brightness: 0,
                    contrast: 0,
                    fade: 0,
                    saturation: 0,
                    temperature: 0,
                    vignette: 0,
                    crop: {
                        zoom: 1,
                        x: 0,
                        y: 0,
                        aspect: "original",
                    },
                };
            });

            return updatedEdits;
        });

        setZoom(1);
        setPos({ x: 0, y: 0 });
        setAspectRatio("original");

        setShowCropBox(true);
    };


    const handleDeletePhoto = () => {
        if (deleteIndex === null) return;

        const updated = images.filter((_, i) => i !== deleteIndex);

        setImages(updated);

        if (updated.length === 0) {
            // if no images left -> close everything
            resetAll();
            onClose();
        } else {
            // adjust active index
            if (activeIndex >= updated.length) {
                setActiveIndex(updated.length - 1);
            }
        }

        setShowDeletePhotoBox(false);
        setDeleteIndex(null);
    };


    const handleReorder = (dropIndex) => {
        if (draggedIndex === null) return;

        setImages((prev) => {
            const updated = [...prev];
            const draggedItem = updated[draggedIndex];

            updated.splice(draggedIndex, 1);
            updated.splice(dropIndex, 0, draggedItem);

            return updated;
        });

        setActiveIndex(dropIndex);
        setDraggedIndex(null);
    };

    // ---------- OPEN FILE PICKER ----------
    const openFilePicker = () => {
        fileInputRef.current.click();
    };

    // ---------- DROP IMAGE ----------
    const handleDrop = (e) => {
        e.preventDefault();
        if (!e.dataTransfer.files.length) return;

        handleAddImages(e.dataTransfer.files);
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
        setImages([]);
        setActiveIndex(0);

        setShowCropBox(false);
        setShowEditBox(false);
        setShowCaptionBox(false);

        setShowDiscardBox(false);
        setShowGallery(false);

        setZoom(1);
        setPos({ x: 0, y: 0 });

        setImageEdits({});

        // ✅ reset caption + settings
        setCaption("");
        setShowEmojiPicker(false);
        setShowAdvancedSettings(false);
        setHideLikeCounts(false);
        setTurnOffCommenting(false);

        // reset crop options
        setAspectRatio("original");
        setShowCropOptions(false);
        setShowZoomSlider(false);

        // reset delete popup states
        setShowDeletePhotoBox(false);
        setDeleteIndex(null);
        setDraggedIndex(null);
    };

    // Function to process image with all filters, adjustments, and crop
    const processImageWithEdits = async (imageUrl, edits) => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous";

            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    // Get crop settings
                    const crop = edits?.crop || { zoom: 1, x: 0, y: 0, aspect: "original" };

                    // Calculate canvas dimensions based on aspect ratio
                    let canvasWidth, canvasHeight;

                    switch (crop.aspect) {
                        case "square":
                            canvasWidth = canvasHeight = Math.min(img.width, img.height);
                            break;
                        case "portrait":
                            canvasWidth = img.width;
                            canvasHeight = (img.width * 5) / 4;
                            break;
                        case "landscape":
                            canvasWidth = img.width;
                            canvasHeight = (img.width * 9) / 16;
                            break;
                        case "original":
                        default:
                            canvasWidth = img.width;
                            canvasHeight = img.height;
                            break;
                    }

                    canvas.width = canvasWidth;
                    canvas.height = canvasHeight;

                    // Apply brightness, contrast, saturation, fade adjustments
                    const brightness = 1 + (edits?.brightness || 0) / 100;
                    const contrast = 1 + (edits?.contrast || 0) / 100;
                    const saturation = 1 + (edits?.saturation || 0) / 100;
                    const fade = (edits?.fade || 0) / 100;

                    // Build filter string with selected filter + adjustments
                    let baseFilter = "";
                    switch (edits?.filter) {
                        case "Aden":
                            baseFilter = "contrast(0.9) saturate(1.2) brightness(1.1)";
                            break;
                        case "Clarendon":
                            baseFilter = "contrast(1.2) saturate(1.35)";
                            break;
                        case "Crema":
                            baseFilter = "contrast(0.9) saturate(1.1) brightness(1.05)";
                            break;
                        case "Gingham":
                            baseFilter = "contrast(0.95) saturate(0.9) brightness(1.05)";
                            break;
                        case "Juno":
                            baseFilter = "contrast(1.15) saturate(1.3)";
                            break;
                        case "Lark":
                            baseFilter = "contrast(1.05) saturate(1.2) brightness(1.05)";
                            break;
                        case "Ludwig":
                            baseFilter = "contrast(1.1) saturate(1.15)";
                            break;
                        case "Moon":
                            baseFilter = "grayscale(0.8) contrast(1.1) brightness(1.05)";
                            break;
                        case "Perpetua":
                            baseFilter = "contrast(1.05) saturate(1.1)";
                            break;
                        case "Reyes":
                            baseFilter = "contrast(0.9) saturate(0.85) brightness(1.1)";
                            break;
                        case "Slumber":
                            baseFilter = "contrast(0.9) saturate(0.8) brightness(1.05)";
                            break;
                        case "Original":
                        default:
                            baseFilter = "";
                            break;
                    }

                    const filterParts = [];
                    if (baseFilter) filterParts.push(baseFilter);
                    filterParts.push(`brightness(${brightness})`);
                    filterParts.push(`contrast(${contrast})`);
                    filterParts.push(`saturate(${saturation})`);

                    ctx.filter = filterParts.join(' ');

                    // Apply fade (opacity)
                    ctx.globalAlpha = 1 - fade * 0.3;

                    // Calculate zoom and position
                    const zoom = crop.zoom || 1;
                    const offsetX = crop.x || 0;
                    const offsetY = crop.y || 0;

                    // Calculate source dimensions (cropped area from original image)
                    const sourceWidth = canvasWidth / zoom;
                    const sourceHeight = canvasHeight / zoom;

                    // Calculate source position (center of image + offset)
                    const sourceX = (img.width - sourceWidth) / 2 - offsetX / zoom;
                    const sourceY = (img.height - sourceHeight) / 2 - offsetY / zoom;

                    // Draw the cropped and zoomed image
                    ctx.drawImage(
                        img,
                        sourceX,
                        sourceY,
                        sourceWidth,
                        sourceHeight,
                        0,
                        0,
                        canvasWidth,
                        canvasHeight
                    );

                    // Apply temperature (warm/cool overlay)
                    const temperature = (edits?.temperature || 0) / 100;
                    if (temperature !== 0) {
                        ctx.globalAlpha = Math.abs(temperature) * 0.08;
                        ctx.fillStyle = temperature > 0 ? 'rgba(255, 140, 0, 1)' : 'rgba(0, 140, 255, 1)';
                        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                    }

                    // Apply vignette
                    const vignette = (edits?.vignette || 0) / 100;
                    if (vignette > 0) {
                        const gradient = ctx.createRadialGradient(
                            canvasWidth / 2,
                            canvasHeight / 2,
                            0,
                            canvasWidth / 2,
                            canvasHeight / 2,
                            Math.max(canvasWidth, canvasHeight) / 2
                        );
                        gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
                        gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0)');
                        gradient.addColorStop(1, `rgba(0, 0, 0, ${vignette * 0.8})`);

                        ctx.globalAlpha = 1;
                        ctx.fillStyle = gradient;
                        ctx.fillRect(0, 0, canvasWidth, canvasHeight);
                    }

                    // Convert canvas to blob
                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject(new Error("Failed to create image blob"));
                        }
                    }, 'image/jpeg', 0.95);

                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => {
                reject(new Error("Failed to load image"));
            };

            img.src = imageUrl;
        });
    };

    const handleSharePost = async () => {
        try {
            setIsSharing(true);

            if (!user) throw new Error("User not logged in!");
            if (images.length === 0) throw new Error("No images selected!");

            // 1) Create post
            const { data: postData, error: postError } = await supabase
                .from("posts")
                .insert([
                    {
                        user_id: user.id,
                        caption,
                        hide_like_counts: hideLikeCounts,
                        turn_off_commenting: turnOffCommenting,
                    },
                ])
                .select()
                .single();

            if (postError) throw postError;

            const postId = postData.id;

            // 2) Process and upload each image
            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                const edits = imageEdits[img.id] || null;

                // Process image with all filters and adjustments
                const processedBlob = await processImageWithEdits(img.url, edits);

                const fileExt = "jpg"; // Always save as jpg since we're processing

                // IMPORTANT: file path must start with user.id for RLS policy
                const filePath = `${user.id}/${postId}/${crypto.randomUUID()}.${fileExt}`;

                // Upload processed image to storage bucket
                const { error: uploadError } = await supabase.storage
                    .from("posts")
                    .upload(filePath, processedBlob, {
                        contentType: 'image/jpeg',
                    });

                if (uploadError) throw uploadError;

                // Insert into post_images table (no need to store edits anymore)
                const { error: imgInsertError } = await supabase
                    .from("post_images")
                    .insert([
                        {
                            post_id: postId,
                            image_path: filePath,
                            order_index: i,
                        },
                    ]);

                if (imgInsertError) throw imgInsertError;
            }

            // success
            resetAll();
            onClose();
        } catch (err) {
            console.error("Error sharing post:", err);
            alert(err.message);
        } finally {
            setIsSharing(false);
        }
    };


    return (
        <>
            {/* Overlay */}
            <div
                className="createpost-overlay"
                onClick={() => {
                    if (isSharing) return;
                    setShowDiscardBox(true);
                }}
            ></div>


            {/* Hidden File Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={(e) => {
                    if (e.target.files.length > 0) {
                        handleAddImages(e.target.files);
                    }
                    e.target.value = "";
                }}
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
                        <h2>{isSharing ? "Sharing Post..." : "Create new post"}</h2>

                        <button
                            className="createpost-close-btn"
                            onClick={() => {
                                if (isSharing) return;
                                resetAll();
                                onClose();
                            }}
                            disabled={isSharing}
                        >
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
            {showCropBox && !showEditBox && (
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

                        <button
                            className="crop-next-btn"
                            onClick={() => {
                                const id = images[activeIndex]?.id;
                                if (!id) return;

                                // Save current crop data for this image
                                setImageEdits((prev) => ({
                                    ...prev,
                                    [id]: {
                                        ...(prev[id] || {
                                            filter: "Original",
                                            brightness: 0,
                                            contrast: 0,
                                            fade: 0,
                                            saturation: 0,
                                            temperature: 0,
                                            vignette: 0,
                                        }),
                                        crop: {
                                            zoom,
                                            x: pos.x,
                                            y: pos.y,
                                            aspect: aspectRatio,
                                        },
                                    },
                                }));

                                setShowEditBox(true);
                            }}
                        >
                            Next
                        </button>

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
                                src={images[activeIndex]?.url}
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
                                            min="1"
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
                        <div className="media-gallery-btn" onClick={() => setShowGallery(!showGallery)}>
                            <svg
                                aria-label="Open media gallery"
                                fill="currentColor"
                                height="16"
                                role="img"
                                viewBox="0 0 24 24"
                                width="16"
                            >
                                <path
                                    d="M19 15V5a4.004 4.004 0 0 0-4-4H5a4.004 4.004 0 0 0-4 4v10a4.004 4.004 0 0 0 4 4h10a4.004 4.004 0 0 0 4-4ZM3 15V5a2.002 2.002 0 0 1 2-2h10a2.002 2.002 0 0 1 2 2v10a2.002 2.002 0 0 1-2 2H5a2.002 2.002 0 0 1-2-2Zm18.862-8.773A.501.501 0 0 0 21 6.57v8.431a6 6 0 0 1-6 6H6.58a.504.504 0 0 0-.35.863A3.944 3.944 0 0 0 9 23h6a8 8 0 0 0 8-8V9a3.95 3.95 0 0 0-1.138-2.773Z"
                                    fillRule="evenodd"
                                ></path>
                            </svg>
                        </div>
                        {showGallery && (
                            <div className="media-gallery-popup" onClick={(e) => e.stopPropagation()}>
                                <div className="media-gallery-grid">
                                    {images.map((img, index) => (
                                        <div
                                            key={img.id}
                                            className={`media-thumb ${index === activeIndex ? "active" : ""}`}
                                            draggable
                                            onClick={() => {
                                                setActiveIndex(index);

                                                const edit = imageEdits[images[index].id];

                                                if (edit?.crop) {
                                                    setZoom(edit.crop.zoom);
                                                    setPos({ x: edit.crop.x, y: edit.crop.y });
                                                    setAspectRatio(edit.crop.aspect);
                                                } else {
                                                    setZoom(1);
                                                    setPos({ x: 0, y: 0 });
                                                    setAspectRatio("original");
                                                }
                                            }}

                                            onDragStart={() => setDraggedIndex(index)}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={() => handleReorder(index)}
                                        >
                                            <img src={img.url} alt="thumb" />

                                            <button
                                                className="thumb-remove"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setDeleteIndex(index);
                                                    setShowDeletePhotoBox(true);
                                                }}
                                            >
                                                ✕
                                            </button>

                                        </div>
                                    ))}

                                    {/* ADD MORE */}
                                    <div
                                        className="media-thumb add"
                                        onClick={() => fileInputRef.current.click()}
                                    >
                                        +
                                    </div>
                                </div>
                            </div>
                        )}


                    </div>
                </div>
            )}

            {/* Edit Box */}
            {showCropBox && showEditBox && (
                <div className="edit-modal">
                    {/* Header */}
                    <div className="edit-header">
                        <button
                            className="crop-back-btn"
                            onClick={() => setShowEditBox(false)}
                        >
                            <ArrowLeft size={20} strokeWidth={1.5} />
                        </button>

                        <h2>Edit</h2>

                        <button className="crop-next-btn" onClick={() => setShowCaptionBox(true)}>
                            Next
                        </button>
                    </div>

                    <div className="createpost-divider"></div>

                    <div className="edit-body">
                        {/* LEFT IMAGE PREVIEW */}
                        <div className="edit-preview">
                            {activeIndex > 0 && (
                                <button
                                    className="edit-arrow left"
                                    onClick={() => setActiveIndex((prev) => prev - 1)}
                                >
                                    ‹
                                </button>
                            )}

                            {activeIndex < images.length - 1 && (
                                <button
                                    className="edit-arrow right"
                                    onClick={() => setActiveIndex((prev) => prev + 1)}
                                >
                                    ›
                                </button>
                            )}


                            {images[activeIndex] && (() => {
                                const currentEdit = getCurrentEdit() || {
                                    filter: "Original",
                                    brightness: 0,
                                    contrast: 0,
                                    fade: 0,
                                    saturation: 0,
                                    temperature: 0,
                                    vignette: 0,
                                    crop: { zoom: 1, x: 0, y: 0, aspect: "original" }
                                };

                                const cropAspect = currentEdit.crop?.aspect || 'original';

                                return (
                                    <div className={`edit-preview-wrapper ${cropAspect}`}>
                                        <img
                                            src={images[activeIndex].url}
                                            alt="preview"
                                            className="edit-preview-img"
                                            draggable={false}
                                            style={{
                                                ...getFilterStyle(currentEdit),
                                                transform: `translate(calc(-50% + ${currentEdit.crop?.x || 0}px), calc(-50% + ${currentEdit.crop?.y || 0}px)) scale(${currentEdit.crop?.zoom || 1})`,
                                                position: "absolute",
                                                top: "50%",
                                                left: "50%",
                                                objectFit: "contain",
                                            }}
                                        />
                                    </div>
                                );
                            })()}


                            {/* DOTS */}
                            <div className="edit-dots">
                                {images.map((_, i) => (
                                    <span
                                        key={i}
                                        className={`edit-dot ${i === activeIndex ? "active" : ""}`}
                                    ></span>
                                ))}
                            </div>

                        </div>

                        {/* RIGHT PANEL */}
                        <div className="edit-panel">
                            <div className="edit-tabs">
                                <button
                                    className={`edit-tab ${activeTab === "filters" ? "active" : ""}`}
                                    onClick={() => setActiveTab("filters")}
                                >
                                    Filters
                                </button>

                                <button
                                    className={`edit-tab ${activeTab === "adjustments" ? "active" : ""}`}
                                    onClick={() => setActiveTab("adjustments")}
                                >
                                    Adjustments
                                </button>
                            </div>


                            <div className="edit-divider"></div>

                            {/* FILTER GRID */}
                            {activeTab === "filters" && (
                                <div className="filters-grid">
                                    {[
                                        "Original",
                                        "Aden",
                                        "Clarendon",
                                        "Crema",
                                        "Gingham",
                                        "Juno",
                                        "Lark",
                                        "Ludwig",
                                        "Moon",
                                        "Perpetua",
                                        "Reyes",
                                        "Slumber",
                                    ].map((filter) => {
                                        const currentEdit = getCurrentEdit();

                                        return (
                                            <div
                                                key={filter}
                                                className={`filter-card ${currentEdit?.filter === filter ? "active" : ""}`}
                                                onClick={() => updateEdit("filter", filter)}
                                            >
                                                <div className="filter-preview">
                                                    <img
                                                        src={images[activeIndex]?.url}
                                                        alt="filter-preview"
                                                        style={{
                                                            width: "100%",
                                                            height: "100%",
                                                            objectFit: "cover",
                                                            ...getFilterStyle({
                                                                filter,
                                                                brightness: 0,
                                                                contrast: 0,
                                                                fade: 0,
                                                                saturation: 0,
                                                                temperature: 0,
                                                            }),
                                                        }}
                                                    />
                                                </div>
                                                <p>{filter}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {activeTab === "adjustments" && (
                                <div className="adjustments-box">
                                    {[
                                        { key: "brightness", label: "Brightness" },
                                        { key: "contrast", label: "Contrast" },
                                        { key: "fade", label: "Fade" },
                                        { key: "saturation", label: "Saturation" },
                                        { key: "temperature", label: "Temperature" },
                                        { key: "vignette", label: "Vignette", min: 0, max: 100 },
                                    ].map((adj) => {
                                        const value = getCurrentEdit()?.[adj.key] ?? 0;

                                        return (
                                            <div key={adj.key} className="adjustment-row">
                                                <div className="adjustment-top">
                                                    <p>{adj.label}</p>

                                                    {value !== 0 && (
                                                        <button
                                                            className="adjust-reset"
                                                            onClick={() => updateEdit(adj.key, 0)}
                                                        >
                                                            Reset
                                                        </button>
                                                    )}
                                                </div>

                                                <input
                                                    type="range"
                                                    min={adj.min ?? -100}
                                                    max={adj.max ?? 100}
                                                    value={value}
                                                    onChange={(e) => updateEdit(adj.key, parseInt(e.target.value))}
                                                    className="adjust-slider"
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}

            {/* =======================
          CAPTION MODAL
      ======================= */}
            {showCropBox && showEditBox && showCaptionBox && (
                <div className="caption-modal">
                    {/* LOADER OVERLAY */}
                    {isSharing && (
                        <div className="sharing-popup-overlay">
                            <div className="sharing-popup-box">

                                <div className="sharing-popup-header">
                                    Sharing your post...
                                </div>

                                <div className="sharing-popup-divider"></div>

                                <div className="sharing-popup-body">

                                    <div className="loader-brand">
                                        <h1 className="loader-title brand-gradient">CodeGram</h1>
                                    </div>

                                    <div className="loader-spinner"></div>

                                    <p className="loader-text">Uploading photos...</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <div className="caption-header">
                        <button
                            className="crop-back-btn"
                            onClick={() => setShowCaptionBox(false)}
                        >
                            <ArrowLeft size={20} strokeWidth={1.5} />
                        </button>

                        <h2>Create new post</h2>

                        <button
                            className="crop-next-btn"
                            onClick={handleSharePost}
                            disabled={isSharing}
                        >
                            {isSharing ? "Sharing..." : "Share"}
                        </button>


                    </div>

                    <div className="createpost-divider"></div>

                    <div className="caption-body">
                        {/* LEFT IMAGE PREVIEW */}
                        <div className="caption-preview">
                            {activeIndex > 0 && (
                                <button
                                    className="edit-arrow left"
                                    onClick={() => setActiveIndex((prev) => prev - 1)}
                                >
                                    ‹
                                </button>
                            )}

                            {activeIndex < images.length - 1 && (
                                <button
                                    className="edit-arrow right"
                                    onClick={() => setActiveIndex((prev) => prev + 1)}
                                >
                                    ›
                                </button>
                            )}

                            {images[activeIndex] && (() => {
                                const currentEdit = getCurrentEdit() || {
                                    filter: "Original",
                                    brightness: 0,
                                    contrast: 0,
                                    fade: 0,
                                    saturation: 0,
                                    temperature: 0,
                                    vignette: 0,
                                    crop: { zoom: 1, x: 0, y: 0, aspect: "original" }
                                };

                                const cropAspect = currentEdit.crop?.aspect || 'original';

                                return (
                                    <div className={`edit-preview-wrapper ${cropAspect}`}>
                                        <img
                                            src={images[activeIndex].url}
                                            alt="preview"
                                            className="edit-preview-img"
                                            draggable={false}
                                            style={{
                                                ...getFilterStyle(currentEdit),
                                                transform: `translate(calc(-50% + ${currentEdit.crop?.x || 0}px), calc(-50% + ${currentEdit.crop?.y || 0}px)) scale(${currentEdit.crop?.zoom || 1})`,
                                                position: "absolute",
                                                top: "50%",
                                                left: "50%",
                                                objectFit: "contain",
                                            }}
                                        />
                                    </div>
                                );
                            })()}

                            {/* DOTS */}
                            <div className="edit-dots">
                                {images.map((_, i) => (
                                    <span
                                        key={i}
                                        className={`edit-dot ${i === activeIndex ? "active" : ""}`}
                                    ></span>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT PANEL - CAPTION */}
                        <div className="caption-panel">
                            {/* User Info */}
                            <div className="caption-user-info">
                                {profile?.avatar_url ? (
                                    <img
                                        src={profile.avatar_url}
                                        alt="avatar"
                                        className="caption-avatar"
                                    />
                                ) : (
                                    <div className="caption-avatar-placeholder">
                                        {user?.email?.[0]?.toUpperCase() || "U"}
                                    </div>
                                )}
                                <span className="caption-username">
                                    {profile?.username || user?.email?.split('@')[0] || "user"}
                                </span>
                            </div>

                            {/* Caption Input */}
                            <div className="caption-input-wrapper">
                                <textarea
                                    className="caption-textarea"
                                    placeholder="Write a caption..."
                                    value={caption}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 2200) {
                                            setCaption(e.target.value);
                                        }
                                    }}
                                    maxLength={2200}
                                />

                                {/* Character count and emoji */}
                                <div className="caption-footer">
                                    <button
                                        className="emoji-btn"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    >
                                        <SmileIcon size={20} />
                                    </button>
                                    <span className="char-count">
                                        {caption.length}/2,200
                                    </span>
                                </div>

                                {/* Simple Emoji Picker */}
                                {showEmojiPicker && (
                                    <div className="emoji-picker">
                                        {['😀', '😂', '😍', '🥰', '😎', '🤔', '👍', '❤️', '🔥', '✨', '🎉', '💯', '🙌', '👏', '💪', '🌟', '⭐', '💖', '😊', '😢', '😭', '🥺', '😴', '🤗', '🙏', '💕', '🎈', '🎊', '🌈', '☀️', '🌙', '⚡', '💫', '🌸', '🌺', '🌻', '🌹', '🌷', '🍀', '🎄', '🎃'].map(emoji => (
                                            <button
                                                key={emoji}
                                                className="emoji-item"
                                                onClick={() => {
                                                    setCaption(prev => prev + emoji);
                                                    setShowEmojiPicker(false);
                                                }}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Advanced Settings */}
                            <div className="advanced-settings-section">
                                <button
                                    className="advanced-settings-toggle"
                                    onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                                >
                                    <span>Advanced settings</span>
                                    <svg
                                        className={`toggle-icon ${showAdvancedSettings ? 'open' : ''}`}
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </button>

                                {showAdvancedSettings && (
                                    <div className="advanced-settings-content">
                                        {/* Hide Like Counts */}
                                        <div className="setting-item">
                                            <div className="setting-header">
                                                <span className="setting-title">Hide like and view counts on this post</span>
                                                <div
                                                    className={`toggle-switch ${hideLikeCounts ? "on" : ""}`}
                                                    onClick={() => setHideLikeCounts(!hideLikeCounts)}
                                                >
                                                    <div className="toggle-circle"></div>
                                                </div>

                                            </div>
                                            <p className="setting-description">
                                                Only you will see the total number of likes and views on this post. You can change this later by going to the ··· menu at the top of the post. To hide like counts on other people's posts, go to your account settings.
                                            </p>
                                        </div>

                                        {/* Turn Off Commenting */}
                                        <div className="setting-item">
                                            <div className="setting-header">
                                                <span className="setting-title">Turn off commenting</span>
                                                <div
                                                    className={`toggle-switch ${turnOffCommenting ? "on" : ""}`}
                                                    onClick={() => setTurnOffCommenting(!turnOffCommenting)}
                                                >
                                                    <div className="toggle-circle"></div>
                                                </div>
                                            </div>
                                            <p className="setting-description">
                                                You can change this later by going to the ··· menu at the top of your post.
                                            </p>
                                        </div>
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
                            If you leave, your edits won't be saved.
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

            {showDeletePhotoBox && (
                <div className="discard-modal">
                    <div className="discard-box">
                        <h3 className="discard-title">Discard photo?</h3>

                        <p className="discard-subtitle">
                            This will remove the photo from your post.
                        </p>

                        <div className="discard-divider"></div>

                        <div
                            className="discard-action discard-red"
                            onClick={handleDeletePhoto}
                        >
                            Delete
                        </div>

                        <div className="discard-divider"></div>

                        <div
                            className="discard-action"
                            onClick={() => {
                                setShowDeletePhotoBox(false);
                                setDeleteIndex(null);
                            }}
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