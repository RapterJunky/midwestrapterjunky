import { NextResponse, type NextRequest } from "next/server";
import { Flags } from "@lib/config/flags";
import { hasFlag } from "@lib/config/hasFlag";

export function middleware(request: NextRequest) {

  if (request.nextUrl.pathname.startsWith("/threads")) {
    if (hasFlag(Flags.Forms)) return NextResponse.next();
    return NextResponse.rewrite(new URL("/404", request.nextUrl.origin));
  }

  if (request.nextUrl.pathname.startsWith("/plugins")) {
    const token = request.nextUrl.searchParams.get("token");
    if (!token || token !== process.env.PLUGIN_TOKEN)
      return NextResponse.rewrite(new URL("/404", request.nextUrl.origin));
  }


  return NextResponse.next();
}

export const config = {
  matcher: ["/plugins/(.*)", "/threads/:path*"],
};
