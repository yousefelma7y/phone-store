import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("user")?.value;
  // const role = req.cookies.get("role")?.value;

  console.log("Token:", token);
  const isAuthPage = req.nextUrl.pathname.startsWith("/signin");

  if (req.nextUrl.pathname == "/") {
    if (isAuthPage)
      return NextResponse.redirect(new URL("/dashboard", req.url));
    else return NextResponse.redirect(new URL("/signin", req.url));
  }
  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL("/signin", req.url));
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  if (
    token &&
    req.nextUrl.pathname.startsWith("/dashboard/team/")
  ) {
    console.log("Redirecting non-admin from team subroutes");
    return NextResponse.redirect(new URL("/dashboard/team", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/signin", "/dashboard/:path*"],
};
