const MAX_DIMENSION = 1600;

export function isHeic(file) {
  return /heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name);
}

// Converts HEIC to JPEG, shrinks large photos, and returns a JPEG File
export async function prepareImage(file) {
  let blob = file;

  if (isHeic(file)) {
    const heic2any = (await import("heic2any")).default;
    const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 });
    blob = Array.isArray(result) ? result[0] : result;
  }

  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const out = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!out) throw new Error("Could not process image");

  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([out], name, { type: "image/jpeg" });
}