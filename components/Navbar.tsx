import Image from "next/image";
import Link from "next/link";
import { Transition } from '@headlessui/react';
import { useEffect, useRef, useState } from "react";
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
    const ref = useRef<HTMLElement>(null);

    const onScroll = () => {
        if(!ref.current) return;

        console.log(window.scrollY);

        if(window.scrollY > 0) {
            ref.current.classList.remove("bg-opacity-0");
            ref.current.classList.add("bg-opacity-100");
            ref.current.classList.add("text-black");
        } else {
            ref.current.classList.add("bg-opacity-0");
            ref.current.classList.remove("bg-opacity-100");
            ref.current.classList.remove("text-black");
        }
    };

    useEffect(()=>{
        window.addEventListener("scroll",onScroll);
        return () => {
            window.removeEventListener("scroll",onScroll);
        };
    },[]);


    return (
        <nav ref={ref} className={`flex-row-reverse md:flex-row flex top-0 z-50 w-full justify-between content-center bg-gray-50 px-6 py-2 ${fixed ? "fixed text-white hover:text-black bg-opacity-0 hover:bg-opacity-100 transition-all duration-700 ease-in-out" : ""}`}>
            <Transition show={showNav} as="aside" className="w-full absolute top-0 left-0 h-screen flex z-50"
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full">
                    <nav className="opacity-100 h-full w-3/4 flex flex-col bg-zinc-800">
                        <div className="relative flex justify-center pt-2 pb-2">
                            <button className="absolute right-4 top-4" onClick={()=>setShowNav(false)}>
                                <HiX className="text-4xl text-gray-50"/>
                            </button>
                            <div className="relative object-contain h-28 w-28">
                                <Image src="/new_logo.webp" alt="raptor junkies" fill/>
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
            </Transition>
            <div className="mx-auto md:mx-0">
                <Image src="/new_logo.webp" alt="site logo" width={65} height={65} className="h-16 w-16 md:h-full md:w-full"/>
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