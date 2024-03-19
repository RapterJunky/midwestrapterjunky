import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import IconLink from "@/components/ui/IconLink";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";
import { capitlize } from "@/lib/utils/capitlize";
import type { LinkWithIcon, ResponsiveImage } from "@/types/page";

const Sidenav: React.FC<{ links: LinkWithIcon[]; logo: ResponsiveImage }> = ({
  links,
  logo,
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          data-cy="sidenav-btn"
          variant="ghost"
          size="icon"
          className="duration-inherit"
        >
          <Menu className="h-8 w-8" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full md:w-screen md:max-w-md">
        <SheetHeader className="relative flex items-center justify-center pb-2 pt-2">
          <Link
            href="/"
            className="relative h-28 w-28 object-contain"
            aria-label="Logo"
            data-cy="mobile-logo"
          >
            <Image
              blurDataURL={logo.blurUpThumb ?? ""}
              src={logo.responsiveImage?.src ?? "/new_logo.webp"}
              alt={logo.responsiveImage?.alt ?? "site logo"}
              sizes={logo.responsiveImage?.sizes ?? "100vw"}
              fill
              className="object-cover object-center"
            />
          </Link>
        </SheetHeader>
        <ul className="divide-y">
          {links.map((value, i) => (
            <li key={i} className="flex justify-start">
              <IconLink
                dataCy="mobile-nav-link"
                className="flex h-16 w-full items-center justify-start gap-1 hover:bg-zinc-100"
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
      </SheetContent>
    </Sheet>
  );
};

export default Sidenav;
