import path from "path";
import { createSupabaseAdmin, supabaseTables } from "@/lib/supabase/server";
import { resolveUploadContentType } from "@/lib/media";

function createUploadFilename(originalName: string): string {
  const ext = path.extname(originalName) || ".jpg";
  return `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
}

export async function uploadMediaToSupabase(
  file: File,
  contentTypeOverride?: string
): Promise<{ url: string; path: string }> {
  const supabase = createSupabaseAdmin();
  const objectPath = createUploadFilename(file.name);
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const contentType =
    contentTypeOverride || resolveUploadContentType(file);

  const { error } = await supabase.storage
    .from(supabaseTables.uploadsBucket)
    .upload(objectPath, buffer, {
      contentType,
      upsert: false,
    });

  if (error) {
    console.error("[supabase/upload]", {
      path: objectPath,
      contentType,
      bytes: buffer.length,
      message: error.message,
      name: error.name,
      // StorageError may include statusCode / cause depending on client version
      ...(error as { statusCode?: string; status?: number }),
    });
    throw new Error(
      `Storage upload failed: ${error.message} (type=${contentType}, size=${buffer.length})`
    );
  }

  const { data } = supabase.storage
    .from(supabaseTables.uploadsBucket)
    .getPublicUrl(objectPath);

  return {
    url: data.publicUrl,
    path: objectPath,
  };
}

export async function uploadBufferToSupabase(
  buffer: Buffer,
  filename: string,
  contentType?: string
): Promise<string> {
  const supabase = createSupabaseAdmin();
  const objectPath = createUploadFilename(filename);
  const resolvedType = contentType || "application/octet-stream";

  const { error } = await supabase.storage
    .from(supabaseTables.uploadsBucket)
    .upload(objectPath, buffer, {
      contentType: resolvedType,
      upsert: false,
    });

  if (error) {
    console.error("[supabase/upload]", {
      path: objectPath,
      contentType: resolvedType,
      bytes: buffer.length,
      message: error.message,
    });
    throw new Error(
      `Storage upload failed: ${error.message} (type=${resolvedType}, size=${buffer.length})`
    );
  }

  const { data } = supabase.storage
    .from(supabaseTables.uploadsBucket)
    .getPublicUrl(objectPath);

  return data.publicUrl;
}
