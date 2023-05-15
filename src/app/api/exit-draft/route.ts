import { draftMode } from "next/headers";

export function GET() {
  draftMode().disable();
  return Response.redirect("/", 308);
}