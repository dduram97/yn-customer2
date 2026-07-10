/** Browser-only image compression for admin uploads. */

const MAX_WIDTH = 1920;
const TARGET_MAX_BYTES = 1024 * 1024; // 1MB
const INITIAL_QUALITY = 0.85;
const MIN_QUALITY = 0.72;

const COMPRESSIBLE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const COMPRESSIBLE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
]);

function fileExtension(name: string): string {
  const index = name.lastIndexOf(".");
  return index >= 0 ? name.slice(index).toLowerCase() : "";
}

/** JPG / PNG / WEBP only. GIF·동영상은 원본 유지. */
export function shouldCompressImageFile(file: File): boolean {
  if (file.type === "image/gif" || fileExtension(file.name) === ".gif") {
    return false;
  }
  if (file.type.startsWith("video/")) return false;
  if (COMPRESSIBLE_TYPES.has(file.type)) return true;
  return COMPRESSIBLE_EXTENSIONS.has(fileExtension(file.name));
}

function supportsWebpEncoding(): boolean {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL("image/webp").startsWith("data:image/webp");
  } catch {
    return false;
  }
}

async function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("이미지 압축에 실패했습니다."));
      },
      type,
      quality
    );
  });
}

function replaceExtension(filename: string, ext: string): string {
  const base = filename.replace(/\.[^.]+$/, "") || "image";
  return `${base}${ext}`;
}

export interface CompressImageResult {
  file: File;
  originalBytes: number;
  compressedBytes: number;
  compressMs: number;
  skipped: boolean;
  outputType?: string;
}

/**
 * Resize to max width 1920 and encode as WebP/JPEG (~80–85% quality).
 * Skips when already small enough or not a compressible still image.
 */
export async function compressImageFile(file: File): Promise<CompressImageResult> {
  const originalBytes = file.size;
  const started = performance.now();

  if (!shouldCompressImageFile(file)) {
    return {
      file,
      originalBytes,
      compressedBytes: originalBytes,
      compressMs: Math.round(performance.now() - started),
      skipped: true,
    };
  }

  // Small files: still downscale if wider than max, otherwise skip.
  const bitmap = await createImageBitmap(file);
  try {
    const needsResize = bitmap.width > MAX_WIDTH;
    if (!needsResize && originalBytes <= 500 * 1024) {
      return {
        file,
        originalBytes,
        compressedBytes: originalBytes,
        compressMs: Math.round(performance.now() - started),
        skipped: true,
      };
    }

    const scale = Math.min(1, MAX_WIDTH / Math.max(bitmap.width, 1));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      throw new Error("Canvas를 사용할 수 없습니다.");
    }
    ctx.drawImage(bitmap, 0, 0, width, height);

    const preferWebp = supportsWebpEncoding();
    const outputType = preferWebp ? "image/webp" : "image/jpeg";
    const outputExt = preferWebp ? ".webp" : ".jpg";

    let quality = INITIAL_QUALITY;
    let blob = await canvasToBlob(canvas, outputType, quality);

    while (blob.size > TARGET_MAX_BYTES && quality > MIN_QUALITY) {
      quality = Math.max(MIN_QUALITY, quality - 0.05);
      blob = await canvasToBlob(canvas, outputType, quality);
    }

    // If compression grew the file (rare for PNG→JPEG), keep original.
    if (blob.size >= originalBytes && !needsResize) {
      return {
        file,
        originalBytes,
        compressedBytes: originalBytes,
        compressMs: Math.round(performance.now() - started),
        skipped: true,
      };
    }

    const compressed = new File([blob], replaceExtension(file.name, outputExt), {
      type: outputType,
      lastModified: Date.now(),
    });

    return {
      file: compressed,
      originalBytes,
      compressedBytes: compressed.size,
      compressMs: Math.round(performance.now() - started),
      skipped: false,
      outputType,
    };
  } finally {
    bitmap.close();
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

/** Object URL + filename hash so isVideoMedia can detect .mov etc. */
export function createMediaPreviewUrl(file: File): {
  objectUrl: string;
  previewUrl: string;
} {
  const objectUrl = URL.createObjectURL(file);
  const previewUrl = `${objectUrl}#${encodeURIComponent(file.name)}`;
  return { objectUrl, previewUrl };
}
