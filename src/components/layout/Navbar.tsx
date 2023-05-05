import { useEffect, useRef, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";

import type { LinkWithIcon, ResponsiveImage } from "@type/page";
import Sidenav from "@components/layout/Sidenav";
import HiMenu from "@components/icons/HiMenu";
import Sidebar from "@components/ui/Sidebar";
import IconLink from "@/components/ui/IconLink";
import { HiUser } from "react-icons/hi";

export interface NavProps {
  navbar: {
    pageLinks: LinkWithIcon[];
    logo: ResponsiveImage;
  };
}

interface NavbarProps {
  mode: keyof typeof navbarMode;
  pageLinks: LinkWithIcon[];
  logo: ResponsiveImage;
}

const navbarMode = {
  "fade-scroll":
    "fixed text-white hover:text-black bg-opacity-0 hover:bg-opacity-100 transition-all duration-700 ease-in-out",
  "only-scroll": "fixed bg-opacity-100 text-black shadow",
  none: "text-black bg-opacity-100",
};

const NavDropdown = dynamic(() => import("@/components/ui/NavDropdown"));

const Account: React.FC<{ session: ReturnType<typeof useSession> }> = ({ session }) => {
  if (session.status === "authenticated") return (
    <Link href="/signout" title="Signout" role="button" className="ml-2">
      <Image className="rounded-full shadow-lg" width={40} height={40} src={session.data.user.image ?? ""} alt="avatar" />
    </Link>
  )

  return (
    <div className="ml-2">
      <Link href="/signin" title="Signin" role="button" aria-label="Account" className="h-10 w-10 flex justify-center items-center rounded-full shadow-lg bg-white">
        <HiUser className="text-black h-6 w-6" />
      </Link>
    </div>
  );
}

const Navbar: React.FC<NavbarProps> = ({
  logo,
  pageLinks = [],
  mode = "fade-scroll",
}) => {
  const session = useSession();
  const [showNav, setShowNav] = useState<boolean>(false);
  const ref = useRef<HTMLElement>(null);
  const onScroll = useCallback(() => {
    if (!ref.current || mode !== "fade-scroll") return;
    if (window.scrollY > 0) {
      ref.current.classList.remove("bg-opacity-0", "text-white");
      ref.current.classList.add("bg-opacity-100", "text-black", "shadow");
    } else {
      ref.current.classList.add("bg-opacity-0", "text-white");
      ref.current.classList.remove("bg-opacity-100", "text-black", "shadow");
    }
  }, [mode]);

  const closeNav = () => setShowNav(false);

  useEffect(() => {
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [onScroll]);

  return (
    <>
      {showNav ? (
        <Sidebar onClose={closeNav} side="left">
          <Sidenav onClose={closeNav} logo={logo} pageLinks={pageLinks} />
        </Sidebar>
      ) : null}
      <nav
        ref={ref}
        className={`top-0 z-40 flex w-full flex-row-reverse content-center justify-between bg-white px-6 py-2 md:flex-row ${navbarMode[mode]}`}
      >
        <div className="flex lg:hidden items-center">
          <Account session={session} />
        </div>
        <Link
          href="/"
          aria-label="Logo"
          data-cy="logo"
          className="mx-auto md:mx-0"
        >
          <Image
            src={logo?.responsiveImage?.src ?? "/new_logo.webp"}
            alt={logo?.responsiveImage?.alt ?? "site logo"}
            sizes={logo?.responsiveImage?.sizes ?? "100vw"}
            blurDataURL={logo?.blurUpThumb ?? ""}
            width={65}
            height={65}
            className="object-cover object-center"
          />
        </Link>
        <div className="flex lg:hidden">
          <button
            data-cy="mobile-sidenav-toggle"
            aria-label="Sidenav Toggle"
            className="active:translate-x-1 active:translate-y-1 active:transform"
            onClick={() => setShowNav((state) => !state)}
          >
            <HiMenu className="text-4xl" />
          </button>
        </div>
        <div className="hidden content-center items-center justify-between lg:flex">
          {pageLinks.slice(0, 7).map((value, i) => (
            <IconLink
              dataCy="desktop-nav-link"
              className="flex items-center gap-1 px-2 text-sm font-bold uppercase not-italic hover:opacity-60"
              key={i}
              {...value}
            />
          ))}
          {pageLinks.length > 7 ? <NavDropdown links={pageLinks} /> : null}
          <Account session={session} />
        </div>
      </nav>
    </>
  );
};
export default Navbar;
