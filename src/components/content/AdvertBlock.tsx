import Link from "next/link";
import type { Color } from "@lib/types";

interface AdvertBlockProps {
  headingleft: string;
  textleft: string;
  link: string;
  headingright: string;
  textright: string;
  bgcolor: Color;
}

export default function AdvertBlock(props: AdvertBlockProps) {
  return (
    <div
      style={{
        backgroundColor:
          props.bgcolor.hex ?? "rgb(63 63 70 / var(--tw-bg-opacity))",
      }}
      className="flex flex-wrap items-center justify-center gap-3 py-8 text-white md:flex-nowrap"
    >
      <Link
        href={props.link}
        className="flex w-1/2 flex-col items-center px-3 text-center md:border-r"
      >
        <h4 className="font-semibold">{props.headingleft}</h4>
        <p className="text-sm text-slate-300">{props.textleft}</p>
      </Link>
      <div className="flex w-1/2 flex-col items-center px-3 text-center">
        <h4 className="font-semibold">{props.headingright}</h4>
        <p className="text-sm text-slate-300">{props.textright}</p>
      </div>
    </div>
  );
}
