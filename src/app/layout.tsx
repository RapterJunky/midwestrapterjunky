import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
    metadataBase: new URL(`${process.env.VERCEL_ENV === "development" ? "http://" : "https://"}${process.env.VERCEL_URL}`)
}

const Layout: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <html lang="en">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            </head>
            <body>
                {children}
            </body>
        </html>
    );
}

export default Layout;