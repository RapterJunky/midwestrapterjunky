import Image from "next/image";
import { Transition } from '@headlessui/react';
import { useEffect, useRef, useState, useCallback } from "react";
import { HiMenu, HiX } from 'react-icons/hi';
import IconLink from "./IconLink";
import type { Color, LinkWithIcon, ResponsiveImage } from '@lib/types';

export interface NavProps {
    navbar: {
        bgColor: Color;
        pageLinks: LinkWithIcon[];
        logo: ResponsiveImage;
    }
}

interface NavbarProps {
    mode: "fade-scroll" | "only-scroll" | "none"
    bgColor?: Color;
    pageLinks: LinkWithIcon[];
    logo: ResponsiveImage
}

const navbarMode = {
    "fade-scroll": "fixed text-white hover:text-black bg-opacity-0 hover:bg-opacity-100 transition-all duration-700 ease-in-out",
    "only-scroll": "fixed bg-opacity-100 text-black",
    "none": "text-black bg-opacity-100"
}



export default function Navbar({ mode = "fade-scroll", pageLinks = [], logo }: NavbarProps){
    const [showNav,setShowNav] = useState<boolean>(false);
    const ref = useRef<HTMLElement>(null);
    const onScroll = useCallback(()=>{
        if(!ref.current || mode !== "fade-scroll") return;
        if(window.scrollY > 0) {
            ref.current.classList.remove("bg-opacity-0");
            ref.current.classList.add("bg-opacity-100");
            ref.current.classList.add("text-black");
        } else {
            ref.current.classList.add("bg-opacity-0");
            ref.current.classList.remove("bg-opacity-100");
            ref.current.classList.remove("text-black");
        }
    },[mode]);

    useEffect(()=>{
        window.addEventListener("scroll",onScroll);
        return () => {
            window.removeEventListener("scroll",onScroll);
        };
    },[onScroll]);


    return (
        <nav ref={ref} className={`flex-row-reverse md:flex-row flex top-0 z-50 w-full justify-between content-center bg-gray-50 px-6 py-2 ${navbarMode[mode] ?? ""}`}>
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
                                <Image blurDataURL={logo?.blurUpThumb ?? ""} src={logo?.responsiveImage?.src ?? "/new_logo.webp"} alt={logo?.responsiveImage?.alt ?? "site logo"} sizes={logo?.responsiveImage?.sizes ?? "100vw"} fill className="object-cover object-center"/>
                            </div>
                        </div>
                        <ul className="[&>:not(:last-child)]:border-b">
                            {pageLinks.map((value,i)=>(
                                <li key={i} className="flex">
                                    <IconLink className="text-white pt-5 pb-5 pr-4 pl-4 w-full flex items-center gap-1" key={i} {...value}/>
                                </li>
                            ))}
                        </ul>
                    </nav>
                    <div className="w-1/4 opacity-50 bg-gray-700"></div>
            </Transition>
            <div className="mx-auto md:mx-0">
                <Image src={logo?.responsiveImage?.src ?? "/new_logo.webp"} alt={logo?.responsiveImage?.alt ?? "site logo"} sizes={logo?.responsiveImage?.sizes ?? "100vw"} blurDataURL={logo?.blurUpThumb ?? ""} width={65} height={65} className="object-cover object-center"/>
            </div>
            <div className="flex lg:hidden">
                <button className="active:transform active:translate-x-1 active:translate-y-1" onClick={()=>setShowNav(!showNav)}>
                    <HiMenu className="text-4xl"/>
                </button>
            </div>
            <div className="justify-between items-center content-center hidden lg:flex">
                {pageLinks.map((value,i)=>(
                    <IconLink className="text-sm uppercase font-bold not-italic px-2 hover:opacity-60 flex items-center gap-1" key={i} {...value}/>
                ))}
            </div>
        </nav>
    );
}