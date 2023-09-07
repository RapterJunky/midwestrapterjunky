'use client'
import ErrorPage from "@/components/error/ErrorPage";

export default function GlobalError({
    error,
}: {
    error: { message: string; digest?: string }
}) {
    return (
        <html>
            <body>
                <ErrorPage {...error} />
            </body>
        </html>
    )
}