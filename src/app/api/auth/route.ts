import { NextRequest, NextResponse } from "next/server";

const SITE_PASSWORD = process.env.SITE_PASSWORD || "hiqmah2026";

export async function POST(request: NextRequest) {
  const { password } = await request.json();

  if (password === SITE_PASSWORD) {
    const response = NextResponse.json({ success: true });
    response.cookies.set("site-auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
    return response;
  }

  return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
}
