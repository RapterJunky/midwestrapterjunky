import Image from "next/image";
import Link from "next/link";

import getFullPageProps from "@lib/cache/getFullPageProps";
import IconLink from "@components/ui/IconLink";

type Props = {
    mode: "scroll-only" | "scroll-fade" | "fixed";
}

const navbarMode = {
    "scroll-fade":
        "fixed text-white hover:text-black bg-opacity-0 hover:bg-opacity-100 transition-all duration-700 ease-in-out",
    "scroll-only": "fixed bg-opacity-100 text-black shadow",
    fixed: "text-black bg-opacity-100",
};

const Navbar = async ({ mode }: Props) => {
    const { navbar: { logo, pageLinks } } = await getFullPageProps();

    return (
        <nav className={`group top-0 z-40 flex w-full flex-row-reverse content-center justify-between bg-white px-6 py-2 md:flex-row ${navbarMode[mode]}`}>
            <div className="flex items-center lg:hidden">

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
                    width={65}
                    height={65}
                    className="object-cover object-center"
                />
            </Link>
            <div className="flex lg:hidden"></div>
            <div className="hidden content-center items-center justify-between lg:flex">
                {pageLinks.slice(0, 7).map((value, i) => (
                    <IconLink
                        dataCy="desktop-nav-link"
                        className="flex items-center gap-1 px-2 text-sm font-bold uppercase not-italic hover:opacity-60"
                        key={i}
                        {...value}
                    />
                ))}

            </div>
        </nav>
    );
}

export default Navbar;