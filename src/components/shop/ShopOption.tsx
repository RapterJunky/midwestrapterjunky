import Link from "next/link";
import { useState, useEffect, useRef, useId } from 'react';
import { HiChevronDown } from "react-icons/hi";
import useSearchMeta from "@hook/useSearchMeta";
import type { UrlObject } from "url";

type Options = {
    name: string;
    selectedName: string;
    option: keyof ReturnType<typeof useSearchMeta>;
    data: {
        name: string;
        id: string;
        link: string | UrlObject;
    }[]
}

const ShopOption: React.FC<Options> = ({ option, name, data, selectedName }) => {
    const meta = useSearchMeta();
    const id = useId();
    const ref = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState<boolean>(false);

    useEffect(() => {
        if (open) {
            ref.current?.classList.add("block");
            ref.current?.classList.remove("hidden");
            return;
        }
        ref.current?.classList.add("hidden");
        ref.current?.classList.remove("block");

    }, [open]);

    const selected = meta[option] ? `${selectedName}: ${data.find(value => value.id === meta[option])?.name ?? "All"}` : name;

    return (
        <div className="relative inline-block w-full">
            <div className="lg:hidden mt-3">
                <span className="rounded-md shadow-sm">
                    <button onBlur={() => setTimeout(() => setOpen(false), 200)} onClick={() => setOpen(!open)} type="button" className="flex justify-between w-full rounded-sm border border-accent-3 px-4 py-3 bg-accent-0 text-sm leading-5 font-medium text-accent-8 hover:text-accent-5 focus:outline-none focus:border-blue-300 focus:shadow-outline-normal active:bg-accent-1 active:text-accent-8 transition ease-in-out duration-150" id={id} aria-haspopup="true" aria-expanded="true">
                        {selected}
                        <HiChevronDown className="-mr-1 ml-2 h-5 w-5" />
                    </button>
                </span>
            </div>
            <div ref={ref} className="origin-top-left absolute lg:relative left-0 mt-2 w-full rounded-md shadow-lg lg:shadow-none z-10 mb-10 lg:block hidden">
                <div className="rounded-sm bg-white shadow-xs lg:bg-none lg:shadow-none">
                    <div role="menu" aria-orientation="vertical" aria-labelledby={id}>
                        <ul>
                            <li className={`block text-sm leading-5 text-zinc-600 lg:text-base lg:no-underline lg:font-bold lg:tracking-wide hover:bg-accent-1 lg:hover:bg-transparent hover:text-accent-8 focus:outline-none focus:bg-accent-1 focus:text-accent-8 ${!meta[option] ? "underline" : ""}`}>
                                <Link className="block lg:inline-block px-4 py-2 lg:p-0 lg:my-2 lg:mx-4" href="/shop/search">{name}</Link>
                            </li>
                            {data.map((value, i) => (
                                <li key={i} className={`block text-sm leading-5 text-zinc-600 hover:bg-accent-1 lg:hover:bg-transparent hover:text-zinc-900 focus:outline-none focus:bg-accent-1 focus:text-accent-8 ${meta[option] === value.id ? "underline" : ""}`}>
                                    <Link className="block lg:inline-block px-4 py-2 lg:p-0 lg:my-2 lg:mx-4" href={value.link}>{value.name}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ShopOption