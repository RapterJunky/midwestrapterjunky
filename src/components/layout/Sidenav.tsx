import Image from "next/image";
import Link from "next/link";

import HiX from "@components/icons/HiX";
import IconLink from "@components/IconLink";
import { capitlize } from "@utils/capitlize";

import type { LinkWithIcon, ResponsiveImage } from "@type/page";

interface Props {
  onClose: () => void;
  logo: ResponsiveImage;
  pageLinks: LinkWithIcon[];
}

const Sidenav: React.FC<Props> = ({ onClose, logo, pageLinks }) => {
  return (
    <nav className="flex h-full flex-col">
      <div className="relative flex justify-center pb-2 pt-2">
        <button
          role="button"
          aria-label="Close sidenav"
          data-cy="sidenav-toggle"
          className="absolute right-4 top-4"
          onClick={onClose}
        >
          <HiX className="text-4xl" />
        </button>
        <Link
          href="/"
          className="relative h-28 w-28 object-contain"
          aria-label="Logo"
          data-cy="mobile-logo"
        >
          <Image
            blurDataURL={logo?.blurUpThumb ?? ""}
            src={logo?.responsiveImage?.src ?? "/new_logo.webp"}
            alt={logo?.responsiveImage?.alt ?? "site logo"}
            sizes={logo?.responsiveImage?.sizes ?? "100vw"}
            fill
            className="object-cover object-center"
          />
        </Link>
      </div>
      <ul className="divide-y">
        {pageLinks.map((value, i) => (
          <li key={i} className="flex" onClick={onClose}>
            <IconLink
              dataCy="mobile-nav-link"
              className="flex w-full items-center gap-1 pb-5 pl-4 pr-4 pt-5 hover:bg-gray-100 hover:font-medium"
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
  );
};
export default Sidenav;
