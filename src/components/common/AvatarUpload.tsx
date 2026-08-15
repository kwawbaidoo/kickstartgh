"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";

import { compressImage } from "@/lib/image";
import { apiUpload } from "@/lib/api-client";

type AvatarUploadProps = {
  value?: string;
  onChange: (url: string) => void;
  fallbackText?: string;
  label?: string;
  alt?: string;
};

function AvatarUpload({
  value,
  onChange,
  fallbackText,
  label = "Photo (optional)",
  alt = "Photo preview",
}: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    setError(null);
    try {
      const dataUrl = await compressImage(file);
      const { url } = await apiUpload(dataUrl, file.name);
      onChange(url);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="relative flex size-20 items-center justify-center overflow-hidden rounded-full bg-muted text-lg font-semibold text-muted-foreground ring-1 ring-foreground/10"
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={alt} className="size-full object-cover" />
        ) : fallbackText ? (
          <span>{fallbackText}</span>
        ) : (
          <Camera className="size-6" />
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/50 py-1 text-center text-[10px] font-medium text-white">
          {isUploading ? <Loader2 className="size-3 animate-spin" /> : null}
          {isUploading ? "Uploading" : "Upload"}
        </div>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <span className="text-xs text-muted-foreground">{label}</span>
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}

export { AvatarUpload };
