"use client";

import { useRef, useState } from "react";
import { Camera } from "lucide-react";

import { compressImage } from "@/lib/image";

type CoverImageUploadProps = {
  value?: string;
  onChange: (dataUrl: string) => void;
  label?: string;
  alt?: string;
};

function CoverImageUpload({
  value,
  onChange,
  label = "Cover photo (optional)",
  alt = "Cover photo preview",
}: CoverImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsProcessing(true);
    const dataUrl = await compressImage(file, 1600, 0.75);
    onChange(dataUrl);
    setIsProcessing(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isProcessing}
        className="relative flex aspect-2/1 w-full items-center justify-center overflow-hidden rounded-xl bg-muted text-muted-foreground ring-1 ring-foreground/10"
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={alt} className="size-full object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <Camera className="size-6" />
            <span className="text-xs font-medium">
              {isProcessing ? "Processing..." : "Upload cover photo"}
            </span>
          </div>
        )}
        {value && (
          <div className="absolute inset-x-0 bottom-0 bg-black/50 py-1.5 text-center text-xs font-medium text-white">
            {isProcessing ? "Processing..." : "Change photo"}
          </div>
        )}
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

export { CoverImageUpload };
