import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { host } from "@/lib/utils/host";
import "../styles/globals.css";

const inter = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(host),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta property="fb:app_id" content={process.env.NEXT_PUBLIC_FACKBOOK_APP_ID} />
      </head>
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
