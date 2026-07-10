import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { assertSupabaseOnVercel } from "@/lib/deployment";
import { isAllowedMediaFile } from "@/lib/media";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { uploadMediaToSupabase } from "@/lib/supabase/upload";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  }

  if (!isAllowedMediaFile(file.name, file.type)) {
    return NextResponse.json(
      {
        error:
          "지원하지 않는 파일 형식입니다. 사진, GIF, 동영상만 업로드할 수 있습니다.",
      },
      { status: 400 }
    );
  }

  try {
    assertSupabaseOnVercel();

    // Upload only stores the file. Do NOT revalidate customer pages here —
    // site_content still has the old imageUrl until the admin clicks Save.
    if (isSupabaseConfigured()) {
      const uploaded = await uploadMediaToSupabase(file);
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
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
