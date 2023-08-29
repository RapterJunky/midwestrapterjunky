"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const SearchOption: React.FC<{ name: string, value: string, queryKey: string; }> = ({ queryKey, name, value }) => {
    const searchParams = useSearchParams();
    const isActive = searchParams?.get(queryKey) === value;
    const params = new URLSearchParams(searchParams?.toString());
    params.set(queryKey, value);

    return (
        <li className={`hover:bg-accent-1 focus:bg-accent-1 focus:text-accent-8 block text-sm leading-5 text-zinc-600 hover:text-zinc-900 focus:outline-none lg:hover:bg-transparent ${isActive ? "underline" : ""}`}
        >
            <Link
                className="block px-4 py-2 lg:mx-4 lg:my-2 lg:inline-block lg:p-0"
                href={{ search: params.toString() }}
            >
                {name}
            </Link>
        </li>
    );
}

export default SearchOption;