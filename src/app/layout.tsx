import { Inter } from "next/font/google";
import type { Metadata } from "next";
import "../styles/globals.css";

const inter = Inter({
  variable: "--font-inter",
  display: "swap",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    `${process.env.VERCEL_ENV === "development" ? "http://" : "https://"}${process.env.VERCEL_URL
    }`,
  )
};

const RootLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
