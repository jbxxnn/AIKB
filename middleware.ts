import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const sessionToken =
    request.cookies.get("next-auth.session-token") || request.cookies.get("__Secure-next-auth.session-token")

  // If no session token and trying to access dashboard, redirect to signin
  if (!sessionToken && request.nextUrl.pathname.startsWith("/dashboard")) {
    const signInUrl = new URL("/auth/signin", request.url)
    signInUrl.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(signInUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*"],
}
