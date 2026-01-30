import imageCompression from "browser-image-compression";
import { supabase } from "../lib/supabase";

export function useAvatarUpload(
  profile,
  setAvatarUrl,
  setLoading,
  setProfile // 🔥 REQUIRED
) {
  const uploadAvatar = async (file) => {
    if (!file || !profile) return;

    try {
      setLoading(true);

      const compressedFile = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 512,
        useWebWorker: true,
      });

      const ext = compressedFile.name.split(".").pop();
      const filePath = `${profile.id}.${ext}`;

      await supabase.storage
        .from("avatars")
        .upload(filePath, compressedFile, {
          upsert: true,
          contentType: compressedFile.type,
        });

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      const freshUrl = `${publicUrl}?v=${Date.now()}`;

      // update DB
      await supabase
        .from("profiles")
        .update({ avatar_url: freshUrl })
        .eq("id", profile.id);

      // update LOCAL UI
      setAvatarUrl(freshUrl);

      setProfile((prev) => ({
        ...prev,
        avatar_url: freshUrl,
      }));
    } finally {
      setLoading(false);
    }
  };

  const removeAvatar = async () => {
    if (!profile?.avatar_url) return;

    try {
      setLoading(true);

      const cleanUrl = profile.avatar_url.split("?")[0];
      const path = cleanUrl.split("/avatars/")[1];

      if (path) {
        await supabase.storage.from("avatars").remove([path]);
      }

      await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", profile.id);

      // update LOCAL UI
      setAvatarUrl(null);

      setProfile((prev) => ({
        ...prev,
        avatar_url: null,
      }));
    } finally {
      setLoading(false);
    }
  };

  return { uploadAvatar, removeAvatar };
}
