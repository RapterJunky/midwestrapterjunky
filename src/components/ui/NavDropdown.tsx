import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";

import type { LinkWithIcon } from "types/page";
import HiMenu from "@components/icons/HiMenu";
import IconLink from "@/components/ui/IconLink";

interface Props {
  links: LinkWithIcon[];
}

export default function NavDropdown({ links }: Props) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="inline-flex w-full justify-center px-4 py-2 text-3xl font-medium">
        <HiMenu />
      </Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-4 top-10 mt-1 w-56 origin-top-right divide-y divide-gray-100 rounded-sm bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {links.slice(7).map((value, i) => (
            <Menu.Item key={i}>
              <IconLink
                dataCy="desktop-dropdown-nav-link"
                {...value}
                className="flex w-full items-center gap-1 whitespace-nowrap rounded-sm bg-transparent px-4 py-2 text-sm font-bold uppercase text-black hover:bg-gray-100"
              />
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
