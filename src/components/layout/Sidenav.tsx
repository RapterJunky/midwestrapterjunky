import { HiX } from "react-icons/hi";
import Image from "next/image";

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
    <nav className="flex flex-col h-full">
      <div className="relative flex justify-center pt-2 pb-2">
        <button
          role="button"
          aria-label="Close sidenav"
          data-cy="sidenav-toggle"
          className="absolute right-4 top-4"
          onClick={onClose}
        >
          <HiX className="text-4xl" />
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
      <ul className="divide-y">
        {pageLinks.map((value, i) => (
          <li key={i} className="flex" onClick={onClose}>
            <IconLink
              data-cy="nav-top-link"
              className="flex w-full items-center gap-1 pt-5 pb-5 pr-4 pl-4 hover:bg-gray-100 hover:font-medium"
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
