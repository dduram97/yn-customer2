import path from "path";
import { createSupabaseAdmin, supabaseTables } from "@/lib/supabase/server";

function createUploadFilename(originalName: string): string {
  const ext = path.extname(originalName) || ".jpg";
  return `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
}

export async function uploadMediaToSupabase(
  file: File
): Promise<{ url: string; path: string }> {
  const supabase = createSupabaseAdmin();
  const objectPath = createUploadFilename(file.name);
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const { error } = await supabase.storage
    .from(supabaseTables.uploadsBucket)
    .upload(objectPath, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
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

  const { error } = await supabase.storage
    .from(supabaseTables.uploadsBucket)
    .upload(objectPath, buffer, {
      contentType: contentType || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  const { data } = supabase.storage
    .from(supabaseTables.uploadsBucket)
    .getPublicUrl(objectPath);

  return data.publicUrl;
}
