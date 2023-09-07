import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const ErrorPage: React.FC<{ message: string; digest?: string }> = ({ digest }) => {
    return (
        <div className="flex h-screen w-full flex-grow items-center justify-center bg-zinc-200 px-16 md:px-0">
            <div className="flex flex-col items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-8 shadow-2xl md:px-8 lg:px-24">
                <p className="text-6xl font-bold tracking-wider text-zinc-300 md:text-7xl lg:text-9xl">
                    500
                </p>
                <p className="mt-4 text-2xl font-bold tracking-wider text-zinc-500 md:text-3xl lg:text-5xl">
                    Server Error
                </p>
                <p className="mt-8 border-y-2 py-2 text-center text-zinc-500">
                    Whoops, something went wrong on our end.
                </p>
                {digest ? (
                    <div className="bg-zinc-200 w-full p-2 my-2 rounded-sm text-center flex flex-col">
                        <code className="text-xs">
                            {digest}
                        </code>
                    </div>
                ) : null}
                <Link
                    href="/"
                    className="mt-6 flex items-center space-x-2 rounded bg-blue-600 px-4 py-2 text-zinc-100 transition duration-150 hover:bg-blue-700"
                    title="Return Home"
                >
                    <ArrowLeft />
                    <span>Return Home</span>
                </Link>
            </div>
        </div>
    );
}

export default ErrorPage;