export const host = `${
  process.env.NEXT_PUBLIC_VERCEL_ENV === "development" ? "http" : "https"
}://${process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL}`;
