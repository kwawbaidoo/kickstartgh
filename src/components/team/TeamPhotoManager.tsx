"use client";

import { useRef, useState } from "react";
import { Plus, X } from "lucide-react";

import { compressImage } from "@/lib/image";

const MAX_PHOTOS = 12;

type TeamPhotoManagerProps = {
  photos: string[];
  onAdd: (photo: string) => void;
  onRemove: (photo: string) => void;
};

function TeamPhotoManager({ photos, onAdd, onRemove }: TeamPhotoManagerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const atLimit = photos.length >= MAX_PHOTOS;

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsProcessing(true);
    const dataUrl = await compressImage(file, 1280, 0.72);
    onAdd(dataUrl);
    setIsProcessing(false);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo) => (
          <div
            key={photo}
            className="relative aspect-square overflow-hidden rounded-xl bg-muted ring-1 ring-foreground/10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="" className="size-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(photo)}
              aria-label="Remove photo"
              className="absolute top-1.5 right-1.5 flex size-6 items-center justify-center rounded-full bg-black/60 text-white"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}

        {!atLimit && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-input text-muted-foreground hover:bg-muted"
          >
            <Plus className="size-5" />
            <span className="text-xs font-medium">{isProcessing ? "Processing..." : "Add photo"}</span>
          </button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
      />
      <span className="text-xs text-muted-foreground">
        {photos.length}/{MAX_PHOTOS} photos
      </span>
    </div>
  );
}

export { TeamPhotoManager };
