import Link from "next/link";
import { HiEyeOff } from 'react-icons/hi';

export default function ExitPreview(){
    return (
        <Link type="button" href="/api/exit-preview" className="inline-block p-3 bg-red-600 text-white font-medium text-lg leading-tight uppercase rounded-full shadow-md hover:bg-red-700 hover:shadow-lg focus:bg-red-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-red-800 active:shadow-lg transition duration-150 ease-in-out bottom-10 left-10 fixed z-50">
            <HiEyeOff/>
        </Link>
    );
}