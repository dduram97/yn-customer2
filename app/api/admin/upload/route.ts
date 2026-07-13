import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/admin-auth";
import { assertSupabaseOnVercel } from "@/lib/deployment";
import { isAllowedMediaFile, resolveUploadContentType } from "@/lib/media";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { uploadMediaToSupabase } from "@/lib/supabase/upload";

export const dynamic = "force-dynamic";

/** Keep in sync with next.config middlewareClientMaxBodySize / Supabase bucket limit. */
const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (cookieStore.get(ADMIN_COOKIE)?.value !== "true") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to parse FormData";
    console.error("[admin/upload] FormData parse failed:", message, error);
    return NextResponse.json(
      {
        error:
          "업로드 본문을 읽지 못했습니다. 파일이 50MB를 넘거나 연결이 끊겼을 수 있습니다.",
        detail: message,
      },
      { status: 413 }
    );
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  }

  const contentType = resolveUploadContentType(file);
  console.log(
    `[admin/upload] name=${file.name} type=${file.type || "(empty)"} → ${contentType} size=${file.size}`
  );

  if (!isAllowedMediaFile(file.name, contentType)) {
    return NextResponse.json(
      {
        error:
          "지원하지 않는 파일 형식입니다. 사진, GIF, 동영상(mp4/webm)만 업로드할 수 있습니다.",
      },
      { status: 400 }
    );
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      {
        error: `파일이 너무 큽니다. 최대 ${Math.floor(MAX_UPLOAD_BYTES / (1024 * 1024))}MB까지 업로드할 수 있습니다.`,
        size: file.size,
        maxBytes: MAX_UPLOAD_BYTES,
      },
      { status: 413 }
    );
  }

  try {
    assertSupabaseOnVercel();

    // Upload only stores the file. Do NOT revalidate customer pages here —
    // site_content still has the old imageUrl until the admin clicks Save.
    if (isSupabaseConfigured()) {
      const uploaded = await uploadMediaToSupabase(file, contentType);
      return NextResponse.json({ url: uploaded.url });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = path.extname(file.name) || ".jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const uploadDir = path.join(process.cwd(), "public/uploads");

    await fs.mkdir(uploadDir, { recursive: true });
    await fs.writeFile(path.join(uploadDir, filename), buffer);

    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "업로드에 실패했습니다.";
    console.error("[admin/upload] Storage error:", message, error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
