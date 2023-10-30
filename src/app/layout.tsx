import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";

const inter = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    `${process.env.VERCEL_ENV === "development" ? "http://" : "https://"}${process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL
    }`,
  ),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
}

const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
