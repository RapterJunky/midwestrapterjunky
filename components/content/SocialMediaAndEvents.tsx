import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube  } from 'react-icons/fa';
import Button from "../Button";

interface SocialMediaAndEventsProps {}

export default function SocialMediaAndEvents(props: SocialMediaAndEventsProps){
    return (
        <section className="relative w-full flex h-screen">
            <div className="absolute w-full top-0 h-full flex flex-col z-10">
                <div className='h-96 flex flex-col items-start justify-center pl-36 gap-3 flex-grow'>
                    <div className="flex flex-col gap-2 text-red-700">
                        <h2 className='text-5xl font-bold'>The ultimate Raptor Experience starts here....</h2>
                        <p className='text-2xl'>Here's your chance to take your raptor out in its natural habitat.</p>
                    </div>
                    <Button link href="/events" color={{ primary: "bg-red-700", foucs: "focus:bg-red-800", active: "active:bg-red-800", hover: "hover:bg-red-800" }}>SEE ALL EVENTS</Button>
                </div>
                <div className="social bg-zinc-700 flex flex-col items-center justify-center w-full py-8">
                    <h3 className="text-2xl text-white font-bold">Find us on</h3>
                    <div className='flex flex-wrap gap-5 text-9xl text-[10rem] text-white py-4 justify-center'>
                        <Link href="">
                            <FaFacebook className="text-blue-700"/>
                        </Link>
                        <Link href="">
                            <FaInstagram className="text-amber-400"/>
                        </Link>
                        <Link href="">
                            <FaYoutube className="text-red-600"/>
                        </Link>
                        <Link href="">
                            <FaTwitter className="text-cyan-400"/>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="flex justify-center items-center overflow-hidden pointer-events-none w-full h-full">
                <iframe 
                    className="border-none w-[200%] h-[200%]" 
                    allowFullScreen 
                    allow="autoplay; encrypted-media;" 
                    title="Rare Ford F-150 Raptor Sighting at Northwest Motorsport" 
                    src="https://www.youtube.com/embed/wgOlJ8lvhwM?autoplay=1&loop=1&mute=1&playlist=wgOlJ8lvhwM&controls=0&fs=0" 
                    width="640" 
                    height="360" 
                    frameBorder="0"></iframe>
            </div>
        </section>
    );
}
