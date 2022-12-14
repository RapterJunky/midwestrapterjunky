import Link from "next/link";
import type { Color } from "../../lib/types";

interface AdvertBlockProps {
    headingleft: string;
    textleft: string;
    link: string;
    headingright: string;
    textright: string;
    bgcolor: Color;
}

export default function AdvertBlock(props: AdvertBlockProps){
    return (
        <div style={{ backgroundColor: props.bgcolor.hex ?? "rgb(63 63 70 / var(--tw-bg-opacity))" }} className="text-white flex justify-center items-center gap-3 py-8 flex-wrap md:flex-nowrap">
            <Link href={props.link} className="flex flex-col items-center px-3 md:border-r w-1/2 text-center">
                <h4 className="font-semibold">{props.headingleft}</h4>
                <p className="text-sm text-slate-300">{props.textleft}</p>
            </Link>
            <div className="flex flex-col items-center px-3 w-1/2 text-center">
                <h4 className="font-semibold">{props.headingright}</h4>
                <p className="text-sm text-slate-300">{props.textright}</p>
            </div>
        </div>
    );
}