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
  const ext = src.slice(src.lastIndexOf(".")).toLowerCase();
  return VIDEO_EXTENSIONS.has(ext);
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
