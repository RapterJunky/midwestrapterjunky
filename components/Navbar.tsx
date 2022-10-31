import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { HiMenu, HiX } from 'react-icons/hi';

export interface NavProps {
    navbar: {
        pageLinks: { title: string; link: string }[];
    }
}


interface NavbarProps {
    fixed?: boolean;
    bgColor?: string;
    pageLinks: { title: string; link: string }[];
}

export default function Navbar({ fixed = true, pageLinks = [] }: NavbarProps){
    const [showNav,setShowNav] = useState<boolean>(false);
    return (
        <nav className={`flex top-0 z-50 w-full justify-between content-center bg-opacity-95 bg-gray-50 px-6 py-2 ${fixed ? "fixed" : ""}`}>
            { showNav ? (
                <aside className="w-full absolute top-0 left-0 h-screen flex z-30 transition-all">
                    <nav className="opacity-100 h-full w-3/4 flex flex-col bg-zinc-800">
                        <div className="relative flex justify-center pt-2 pb-2">
                            <button className="absolute right-4 top-4" onClick={()=>setShowNav(false)}>
                                <HiX className="text-4xl text-gray-50"/>
                            </button>
                            <div className="relative object-contain h-28 w-28">
                                <Image src="/raptor-junkies-logo_250px_300x.avif" alt="raptor junkies"/>
                            </div>
                        </div>
                        <ul className="[&>:not(:last-child)]:border-b">
                            {pageLinks.map((value,i)=>(
                                <li key={i} className="flex">
                                    <Link href={value.link} className="text-white pt-5 pb-5 pr-4 pl-4 w-full">
                                        {value.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <div className="w-1/4 opacity-50 bg-gray-700"></div>
                </aside>
            ) : null }
            <div>
                <Image src="/raptor-junkies-logo_250px_150x.webp" alt="site logo" width={80} height={60}/>
            </div>
            <div className="flex lg:hidden">
                <button className="active:transform active:translate-x-1 active:translate-y-1" onClick={()=>setShowNav(!showNav)}>
                    <HiMenu className="text-4xl"/>
                </button>
            </div>
            <div className="justify-between items-center content-center hidden lg:flex">
                {pageLinks.map((value,i)=>(
                    <Link href={value.link} key={i} className="text-sm uppercase font-bold not-italic px-2 hover:opacity-60">
                        {value.title}
                    </Link>
                ))}
            </div>
        </nav>
    );
}