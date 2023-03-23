import Image from "next/image";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState, useCallback } from "react";
import { Portal, Transition } from "@headlessui/react";
import { HiMenu, HiX } from "react-icons/hi";
import IconLink from "@components/IconLink";
import { capitlize } from "@utils/capitlize";

import type { Color, LinkWithIcon, ResponsiveImage } from "types/page";

export interface NavProps {
  navbar: {
    bgColor: Color;
    pageLinks: LinkWithIcon[];
    logo: ResponsiveImage;
  };
}

interface NavbarProps {
  mode: "fade-scroll" | "only-scroll" | "none";
  bgColor?: Color;
  pageLinks: LinkWithIcon[];
  logo: ResponsiveImage;
}

const navbarMode = {
  "fade-scroll":
    "fixed text-white hover:text-black bg-opacity-0 hover:bg-opacity-100 transition-all duration-700 ease-in-out",
  "only-scroll": "fixed bg-opacity-100 text-black",
  none: "text-black bg-opacity-100",
};

const NavDropdown = dynamic(() => import("@components/NavDropdown"));

export default function Navbar({
  mode = "fade-scroll",
  pageLinks = [],
  logo,
}: NavbarProps) {
  const [showNav, setShowNav] = useState<boolean>(false);
  const ref = useRef<HTMLElement>(null);
  const onScroll = useCallback(() => {
    if (!ref.current || mode !== "fade-scroll") return;
    if (window.scrollY > 0) {
      ref.current.classList.remove("bg-opacity-0");
      ref.current.classList.remove("text-white");
      ref.current.classList.add("bg-opacity-100");
      ref.current.classList.add("text-black");
    } else {
      ref.current.classList.add("bg-opacity-0");
      ref.current.classList.add("text-white");
      ref.current.classList.remove("bg-opacity-100");
      ref.current.classList.remove("text-black");
    }
  }, [mode]);

  const close = () => {
    document.body.classList.remove("h-full", "overflow-hidden");
  };

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [onScroll]);

  return (
    <nav
      ref={ref}
      className={`top-0 z-50 flex w-full flex-row-reverse content-center justify-between bg-gray-50 px-6 py-2 md:flex-row ${
        navbarMode[mode] ?? ""
      }`}
    >
      <Transition
        show={showNav}
        as="aside"
        className="absolute top-0 left-0 z-50 flex h-screen w-full"
        enter="transition ease-in-out duration-300 transform"
        enterFrom="-translate-x-full"
        enterTo="translate-x-0"
        leave="transition ease-in-out duration-300 transform"
        leaveFrom="translate-x-0"
        leaveTo="-translate-x-full"
      >
        <nav className="flex h-screen w-3/4 flex-col overflow-y-hidden bg-zinc-800 opacity-100">
          <div className="relative flex justify-center pt-2 pb-2">
            <button
              role="button"
              aria-label="Close sidenav"
              data-cy="sidenav-toggle"
              className="absolute right-4 top-4"
              onClick={() => {
                setShowNav(false);
                close();
              }}
            >
              <HiX className="text-4xl text-gray-50" />
            </button>
            <div className="relative h-28 w-28 object-contain">
              <Image
                blurDataURL={logo?.blurUpThumb ?? ""}
                src={logo?.responsiveImage?.src ?? "/new_logo.webp"}
                alt={logo?.responsiveImage?.alt ?? "site logo"}
                sizes={logo?.responsiveImage?.sizes ?? "100vw"}
                fill
                className="object-cover object-center"
              />
            </div>
          </div>
          <ul className="[&>:not(:last-child)]:border-b">
            {pageLinks.map((value, i) => (
              <li key={i} className="flex" onClick={close}>
                <IconLink
                  data-cy="nav-top-link"
                  className="flex w-full items-center gap-1 pt-5 pb-5 pr-4 pl-4 text-white"
                  key={i}
                  title={capitlize(value.title)}
                  useIcon={value.useIcon}
                  icon={value.icon}
                  iconPosition={value.iconPosition}
                  link={value.link}
                />
              </li>
            ))}
          </ul>
        </nav>
        <div className="w-1/4 bg-gray-700 opacity-50"></div>
      </Transition>
      <div className="mx-auto md:mx-0">
        <Image
          src={logo?.responsiveImage?.src ?? "/new_logo.webp"}
          alt={logo?.responsiveImage?.alt ?? "site logo"}
          sizes={logo?.responsiveImage?.sizes ?? "100vw"}
          blurDataURL={logo?.blurUpThumb ?? ""}
          width={65}
          height={65}
          className="object-cover object-center"
        />
      </div>
      <div className="flex lg:hidden">
        <button
          data-cy="mobile-sidenav-toggle"
          aria-label="Sidenav Toggle"
          className="active:translate-x-1 active:translate-y-1 active:transform"
          onClick={() => {
            setShowNav(!showNav);
            document.body.classList.add("h-full", "overflow-hidden");
          }}
        >
          <HiMenu className="text-4xl" />
        </button>
      </div>
      <div className="hidden content-center items-center justify-between lg:flex">
        {pageLinks.slice(0, 7).map((value, i) => (
          <IconLink
            data-cy="sidenav-link"
            className="flex items-center gap-1 px-2 text-sm font-bold uppercase not-italic hover:opacity-60"
            key={i}
            {...value}
          />
        ))}
        {pageLinks.length > 7 ? <NavDropdown links={pageLinks} /> : null}
      </div>
    </nav>
  );
}
