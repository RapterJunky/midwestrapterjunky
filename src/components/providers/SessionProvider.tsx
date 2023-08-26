"use client";
import { SessionProvider } from "next-auth/react";

const Provider: React.FC<React.PropsWithChildren> = ({ children }) => {
    return (
        <SessionProvider>
            {children}
        </SessionProvider>
    );
}

export default Provider;