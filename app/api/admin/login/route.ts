import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminPassword } from "@/lib/admin-auth";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, "true", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
