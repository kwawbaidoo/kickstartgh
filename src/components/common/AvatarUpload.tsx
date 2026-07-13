"use client";

import { useRef } from "react";
import { Camera } from "lucide-react";

type AvatarUploadProps = {
  value?: string;
  onChange: (dataUrl: string) => void;
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

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
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
        <div className="absolute inset-x-0 bottom-0 bg-black/50 py-1 text-center text-[10px] font-medium text-white">
          Upload
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
    </div>
  );
}

export { AvatarUpload };
