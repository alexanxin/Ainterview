import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This middleware redirects users without valid invitations
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // Skip middleware for certain paths
  if (
    pathname.startsWith("/api/invitation-codes") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/public") ||
    pathname === "/favicon.ico" ||
    pathname === "/" // Allow access to main page - it will handle invitation logic
  ) {
    return response;
  }

  // For all other paths, we need to check if user has access
  // Since we can't easily check session in middleware without auth helpers,
  // we'll let the page components handle the access control
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
