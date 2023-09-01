import { cva, type VariantProps } from "class-variance-authority";
import Image from "next/image";
import Link from "next/link";

import Provider from "@/components/providers/SessionProvider";
import getFullPageProps from "@lib/cache/getFullPageProps";
import IconLink from "@components/ui/IconLink";
import AccountIcon from "./AccountIcon";
import { cn } from '@/lib/utils';
import Sidenav from "./Sidenav";
import LinksDropdown from "./LinksDropdown";
import ScrollRuntime from "./ScrollRuntime";

const navbarVariants = cva("group top-0 z-40 flex w-full content-center bg-white px-6 py-2", {
  variants: {
    variant: {
      default: "text-black bg-opacity-100",
      scrollOnly: "fixed bg-opacity-100 text-black shadow",
      scrollFade: "fixed text-white bg-opacity-0 hover:text-black hover:bg-opacity-100 transition-colors duration-700 ease-in-out"
    }
  },
  defaultVariants: {
    variant: "default"
  }
});

const Navbar: React.FC<VariantProps<typeof navbarVariants>> = async ({ variant }) => {
  const {
    navbar: { logo, pageLinks },
  } = await getFullPageProps();

  return (
    <nav id="navbar"
      className={cn(navbarVariants({ variant }))}
    >
      {variant === "scrollFade" ? <ScrollRuntime /> : null}
      <div className="flex items-center mr-auto lg:hidden lg:mr-0">
        <Sidenav links={pageLinks} logo={logo} />
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
      <div className="hidden content-center items-center lg:flex ml-auto">
        {pageLinks.slice(0, 7).map((value, i) => (
          <IconLink
            dataCy="desktop-nav-link"
            className="uppercase font-bold px-2 text-inherit transition-colors duration-700 ease-in-out"
            key={i}
            {...value}
          />
        ))}
        {pageLinks.length > 7 ? (<LinksDropdown links={pageLinks} />) : null}
      </div>
      <div className="flex items-center ml-auto lg:ml-1">
        <Provider>
          <AccountIcon />
        </Provider>
      </div>
    </nav>
  );
};

export default Navbar;
