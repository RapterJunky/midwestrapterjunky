import Link from "next/link";

interface ButtonProps {
  link?: boolean;
  href?: string;
  full?: boolean;
  color?: {
    primary: string;
    foucs: string;
    active: string;
    hover: string;
  };
}

const defaultConfig: ButtonProps["color"] = {
  primary: "bg-gray-800",
  foucs: "focus:bg-gray-900",
  active: "active:bg-gray-900",
  hover: "hover:bg-gray-900",
};

export default function Button({
  full = false,
  href,
  children,
  color = defaultConfig,
  link,
}: React.PropsWithChildren<ButtonProps>) {
  const className = `${
    full ? "w-full " : ""
  } text-center inline-block px-6 py-2.5 ${
    color?.primary
  } text-white font-medium text-xs leading-tight uppercase rounded-sm shadow-md ${
    color?.hover
  } hover:shadow-lg ${
    color?.foucs
  } focus:shadow-lg focus:outline-none focus:ring-0 ${
    color?.active
  } active:shadow-lg transition duration-150 ease-in-out`;

  if (link) {
    if (!href)
      throw new Error("href is required when using button link as link");
    return (
      <Link type="button" href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={className}>
      {children}
    </button>
  );
}
