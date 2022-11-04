import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube  } from 'react-icons/fa';
import Button from "../Button";

interface VideoWithLinksProps {}

export default function VideoWithLinks(props: VideoWithLinksProps){
    return (
        <section className="relative w-full flex h-screen overflow-hidden">
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
