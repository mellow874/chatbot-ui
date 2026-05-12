import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Skip auth check for login page
  if (request.nextUrl.pathname === "/login") {
    return NextResponse.next()
  }

  // Check for authentication cookie
  const authenticated = request.cookies.get("authenticated")?.value === "true"

  if (!authenticated) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/((?!api|static|.*\\..*|_next).*)"
}
