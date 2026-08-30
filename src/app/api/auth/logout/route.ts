import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const response = NextResponse.redirect(
  new URL("/signin", request.url),
  303
);

  response.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(0),
    path: "/",
  });

  return response;
}

