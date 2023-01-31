import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token || token !== process.env.PLUGIN_TOKEN)
    return NextResponse.rewrite(new URL("/404", request.nextUrl.origin));
}

export const config = {
  matcher: "/plugins/(.*)",
};
