import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const sessionToken =
    request.cookies.get("authjs.session-token") ??
    request.cookies.get("__Secure-authjs.session-token");

  const isLoggedIn = !!sessionToken;
  const { pathname } = request.nextUrl;

  if (
    (pathname.startsWith("/api/chat-api") ||
      pathname.startsWith("/api/vision")) &&
    !isLoggedIn
  ) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (pathname.startsWith("/chat") && !isLoggedIn) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname === "/" && isLoggedIn) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
    "/api/chat-api/:path*",
    "/api/vision/:path*",
  ],
};
