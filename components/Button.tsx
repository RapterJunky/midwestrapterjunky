import Link from "next/link"

interface ButtonProps {
    link?: boolean;
    href?: string;
}

export default function Button(props: React.PropsWithChildren<ButtonProps>){
    if(props?.link) {
        if(!props?.href) throw new Error("href is required when using button link as link");
        return (
            <Link type="button" href={props.href} className="inline-block px-6 py-2.5 bg-gray-800 text-white font-medium text-xs leading-tight uppercase rounded-sm shadow-md hover:bg-gray-900 hover:shadow-lg focus:bg-gray-900 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-gray-900 active:shadow-lg transition duration-150 ease-in-out">
                {props.children}
            </Link>
        );
    }

    return (
        <button type="button" className="inline-block px-6 py-2.5 bg-gray-800 text-white font-medium text-xs leading-tight uppercase rounded-sm shadow-md hover:bg-gray-900 hover:shadow-lg focus:bg-gray-900 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-gray-900 active:shadow-lg transition duration-150 ease-in-out">
            {props.children}
        </button>
    );
}