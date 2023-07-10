import { Menu, Transition } from "@headlessui/react";
import { signOut } from "next-auth/react";
import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";

const AccountDropdown: React.FC<{
  image: string;
  name: string;
  email: string;
}> = ({ image, name, email }) => {
  return (
    <div className="text-black">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="ml-2">
            <Image
              className="rounded-full shadow-lg"
              width={40}
              height={40}
              src={image}
              alt="avatar"
            />
          </Menu.Button>
        </div>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right divide-y divide-gray-400 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <Menu.Item>
              <div className="px-4 py-3">
                <p className="text-base">{name}</p>
                <p className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-light">
                  {email}
                </p>
              </div>
            </Menu.Item>
            <div>
              <Menu.Item>
                <Link
                  prefetch={false}
                  className="block w-full px-4 py-2 hover:bg-neutral-200"
                  href="/profile"
                >
                  Account
                </Link>
              </Menu.Item>
              <Menu.Item>
                <button
                  className="w-full rounded-b-md px-4 py-2 text-left hover:bg-neutral-200"
                  onClick={() => signOut()}
                >
                  Logout
                </button>
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};
export default AccountDropdown;
