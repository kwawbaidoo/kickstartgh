/**
 * Downscales and re-encodes an uploaded image as JPEG before it's stored as
 * a data URL. Everything in this app persists to localStorage, which caps
 * out around 5-10MB per origin, so raw phone-camera photos (often 3-5MB
 * each) would exhaust that budget after just a couple of uploads.
 */
export function compressImage(file: File, maxDimension = 1280, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not load image."));
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const context = canvas.getContext("2d");
        if (!context) {
          resolve(reader.result as string);
          return;
        }
        context.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
