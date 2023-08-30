import { useState, useEffect, useRef, useId } from "react";
import type { UrlObject } from "url";
import Link from "next/link";

import HiChevronDown from "@components/icons/HiChevronDown";
import useSearchMeta from "@hook/useSearchMeta";

type Options = {
  name: string;
  selectedName: string;
  option: keyof ReturnType<typeof useSearchMeta>;
  data: {
    name: string;
    id: string;
    link: string | UrlObject;
  }[];
};

const ShopOption: React.FC<Options> = ({
  option,
  name,
  data,
  selectedName,
}) => {
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

  const selected = meta[option]
    ? `${selectedName}: ${
        data.find((value) => value.id === meta[option])?.name ?? "All"
      }`
    : name;

  return (
    <div className="relative inline-block w-full">
      <div className="mt-3 lg:hidden">
        <span className="rounded-md shadow-sm">
          <button
            onBlur={() => setTimeout(() => setOpen(false), 200)}
            onClick={() => setOpen(!open)}
            type="button"
            className="border-accent-3 bg-accent-0 text-accent-8 hover:text-accent-5 focus:shadow-outline-normal active:bg-accent-1 active:text-accent-8 flex w-full justify-between rounded-sm border px-4 py-3 text-sm font-medium leading-5 transition duration-150 ease-in-out focus:border-blue-300 focus:outline-none"
            id={id}
            aria-haspopup="true"
            aria-expanded="true"
          >
            {selected}
            <HiChevronDown className="-mr-1 ml-2 h-5 w-5" />
          </button>
        </span>
      </div>
      <div
        ref={ref}
        className="absolute left-0 z-10 mb-10 mt-2 hidden w-full origin-top-left rounded-md shadow-lg lg:relative lg:block lg:shadow-none"
      >
        <div className="shadow-xs rounded-sm bg-white lg:bg-none lg:shadow-none">
          <div role="menu" aria-orientation="vertical" aria-labelledby={id}>
            <ul>
              <li
                className={`hover:bg-accent-1 hover:text-accent-8 focus:bg-accent-1 focus:text-accent-8 block text-sm leading-5 text-zinc-600 focus:outline-none lg:text-base lg:font-bold lg:tracking-wide lg:no-underline lg:hover:bg-transparent ${
                  !meta[option] ? "underline" : ""
                }`}
              >
                <Link
                  className="block px-4 py-2 lg:mx-4 lg:my-2 lg:inline-block lg:p-0"
                  href="/shop"
                >
                  {name}
                </Link>
              </li>
              {data.map((value, i) => (
                <li
                  key={i}
                  className={`hover:bg-accent-1 focus:bg-accent-1 focus:text-accent-8 block text-sm leading-5 text-zinc-600 hover:text-zinc-900 focus:outline-none lg:hover:bg-transparent ${
                    meta[option] === value.id ? "underline" : ""
                  }`}
                >
                  <Link
                    className="block px-4 py-2 lg:mx-4 lg:my-2 lg:inline-block lg:p-0"
                    href={value.link}
                  >
                    {value.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopOption;
