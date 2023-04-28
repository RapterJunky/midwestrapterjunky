import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { Flags } from "@lib/config/flags";
import { hasFlag } from "@lib/config/hasFlag";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/community")) {
    const token = await getToken({ req: request });

    if (!hasFlag(Flags.Forms) || !token) return NextResponse.next();

    return NextResponse.rewrite(new URL("/404", request.nextUrl.origin));
  }

  if (request.nextUrl.pathname.startsWith("/shop")) {
    const token = await getToken({ req: request });
    if (!hasFlag(Flags.Forms) || !token) return NextResponse.next();

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
  matcher: ["/plugins/(.*)", "/community/:path*", "/shop/:path*"],
};
