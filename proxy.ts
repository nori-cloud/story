import { type NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if accessing internal routes or profiler API
  if (pathname.startsWith("/internal")) {
    const host = request.headers.get("host") || "";

    // Allow localhost and 127.0.0.1
    const isLocalhost =
      host.startsWith("localhost:") ||
      host.startsWith("127.0.0.1:") ||
      host === "localhost" ||
      host === "127.0.0.1";

    if (!isLocalhost) {
      // For pages, redirect to home page
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/internal/:path*"],
};
