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

export function isVideoMedia(src?: string): boolean {
  if (!src) return false;
  // blob:…#photo.mov — hash carries the original filename for type detection
  const hashName = src.includes("#")
    ? decodeURIComponent(src.slice(src.indexOf("#") + 1))
    : "";
  const path = (hashName || src).split("?")[0].split("#")[0];
  const ext = path.slice(path.lastIndexOf(".")).toLowerCase();
  return VIDEO_EXTENSIONS.has(ext);
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

export function inferMediaTypeFromUrl(
  url: string,
  explicit?: "image" | "gif" | "video"
): "image" | "gif" | "video" {
  if (explicit) return explicit;
  if (url.toLowerCase().endsWith(".gif")) return "gif";
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
