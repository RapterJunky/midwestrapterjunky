import { Transition } from "@headlessui/react";
import { HiX } from "react-icons/hi";
import Image from "next/image";

import IconLink from "@components/IconLink";
import { capitlize } from "@utils/capitlize";

import type { LinkWithIcon, ResponsiveImage } from "@type/page";

interface Props {
  show: boolean;
  onClose: () => void;
  logo: ResponsiveImage;
  pageLinks: LinkWithIcon[];
}

const Sidenav: React.FC<Props> = ({ show, onClose, logo, pageLinks }) => {
  return (
    <Transition
      show={show}
      as="aside"
      className="absolute top-0 left-0 z-50 flex h-screen w-full"
      enter="transition ease-in-out duration-300 transform"
      enterFrom="-translate-x-full"
      enterTo="translate-x-0"
      leave="transition ease-in-out duration-300 transform"
      leaveFrom="translate-x-0"
      leaveTo="-translate-x-full"
    >
      <nav className="flex h-screen w-3/4 flex-col overflow-y-hidden bg-white opacity-100">
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
      <div className="w-1/4 bg-gray-700 opacity-50" onClick={onClose}></div>
    </Transition>
  );
};
export default Sidenav;
