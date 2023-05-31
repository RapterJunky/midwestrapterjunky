import { NextResponse, type NextRequest } from "next/server";
import flagEnabled from "@lib/config/flagEnabled";
import { Flags } from "@lib/config/flags";

export async function middleware(request: NextRequest) {
  //if (request.nextUrl.pathname.startsWith("/404"))
  //  return NextResponse.redirect(new URL("/not-found", request.url), 301);

  if (request.nextUrl.pathname.startsWith("/community")) {
    const enabled = await flagEnabled(Flags.Community);

    if (enabled?.value) return NextResponse.next();

    return NextResponse.redirect(new URL("/not-found", request.url), 302);
  }

  if (request.nextUrl.pathname.startsWith("/shop")) {
    const enabled = await flagEnabled(Flags.Shop);

    if (enabled?.value) return NextResponse.next();
    return NextResponse.redirect(
      new URL("/under-construction", request.url),
      302
    );
  }

  if (request.nextUrl.pathname.startsWith("/plugins")) {
    const token = request.nextUrl.searchParams.get("token");
    if (!token || token !== process.env.PLUGIN_TOKEN)
      return NextResponse.redirect(new URL("/not-found", request.url), 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/plugins/(.*)", "/community/:path*", "/shop/:path*"],
};
