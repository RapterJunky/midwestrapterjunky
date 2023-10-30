export const host = `${process.env.VERCEL_ENV === "development" ? "http" : "https"
    }://${process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL}`;