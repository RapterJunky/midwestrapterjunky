import { NextResponse, type NextRequest } from "next/server";
import flagEnabled from "@/lib/config/flagEnabled";
import { Flags } from "@lib/config/flags";

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/community")) {
    const enabled = await flagEnabled(Flags.Community);

    if (enabled) return NextResponse.next();

    return NextResponse.rewrite(new URL("/404", request.nextUrl.origin));
  }

  if (request.nextUrl.pathname.startsWith("/shop")) {
    const enabled = await flagEnabled(Flags.Shop);

    if (enabled) return NextResponse.next();
    return NextResponse.rewrite(
      new URL("/under-construction", request.nextUrl.origin)
    );
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
