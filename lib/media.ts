const VIDEO_EXTENSIONS = new Set([".mp4", ".webm", ".mov", ".m4v", ".ogg"]);

const ALLOWED_MEDIA_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".gif",
  ".webp",
  ".mp4",
  ".webm",
  ".mov",
  ".m4v",
  ".ogg",
]);

function getMediaPathExtension(src: string): string {
  // blob:…#photo.mov — hash carries the original filename for type detection
  const hashName = src.includes("#")
    ? decodeURIComponent(src.slice(src.indexOf("#") + 1))
    : "";
  const path = (hashName || src).split("?")[0].split("#")[0];
  return path.slice(path.lastIndexOf(".")).toLowerCase();
}

export function isVideoMedia(src?: string): boolean {
  if (!src) return false;
  return VIDEO_EXTENSIONS.has(getMediaPathExtension(src));
}

const STILL_IMAGE_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".bmp",
]);

/**
 * List/home card thumbnails: still images only (no GIF animation, no video/MOV).
 * URLs without a recognized still extension are rejected so heavy media is never
 * pulled into ImagePlaceholder cards.
 */
export function isStillImageMedia(src?: string): boolean {
  if (!src?.trim()) return false;
  const ext = getMediaPathExtension(src.trim());
  if (!ext.startsWith(".")) return false;
  return STILL_IMAGE_EXTENSIONS.has(ext);
}

/** Strip filename hash from blob preview URLs for <img>/<video src>. */
export function resolveMediaDisplaySrc(src?: string): string | undefined {
  if (!src) return undefined;
  if (src.startsWith("blob:") && src.includes("#")) {
    return src.slice(0, src.indexOf("#"));
  }
  return src;
}

export function isAllowedMediaFile(filename: string, mimeType?: string): boolean {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  if (ALLOWED_MEDIA_EXTENSIONS.has(ext)) return true;

  if (!mimeType) return false;
  return mimeType.startsWith("image/") || mimeType.startsWith("video/");
}

const EXT_CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
  ".m4v": "video/x-m4v",
  ".ogg": "video/ogg",
};

/** Prefer browser MIME; fall back to extension (some devices send empty type for mp4). */
export function resolveUploadContentType(file: {
  name: string;
  type: string;
}): string {
  if (file.type && file.type !== "application/octet-stream") {
    return file.type;
  }
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  return EXT_CONTENT_TYPES[ext] || file.type || "application/octet-stream";
}

export function inferMediaTypeFromUrl(
  url: string,
  explicit?: "image" | "gif" | "video"
): "image" | "gif" | "video" {
  if (explicit) return explicit;
  const ext = getMediaPathExtension(url);
  if (ext === ".gif") return "gif";
  if (isVideoMedia(url)) return "video";
  return "image";
}

export function inferMediaTypeFromFile(file: File): "image" | "gif" | "video" {
  if (file.type.startsWith("video/")) return "video";
  if (file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif")) {
    return "gif";
  }
  return "image";
}
