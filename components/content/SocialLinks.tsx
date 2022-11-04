import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaQuestion  } from 'react-icons/fa';

interface SocialLinksProps {
    sociallinks: { logo: string; link: string; }[]
}

const logos = {
    facebook: <FaFacebook className="text-blue-700"/>,
    instagram: <FaInstagram className="text-amber-400"/>,
    youtube: <FaYoutube className="text-red-600"/>,
    twitter: <FaTwitter className="text-cyan-400"/>,
    unkown: <FaQuestion/>
};

export default function SocialLinks(props: SocialLinksProps){
    return (
        <div className="w-full top-0 h-full flex flex-col z-10">
                <div className="social bg-zinc-700 flex flex-col items-center justify-center w-full py-8">
                    <h3 className="text-2xl text-white font-bold">Find us on</h3>
                    <div className='flex flex-wrap gap-5 text-9xl text-[10rem] text-white py-4 justify-center'>
                        {props.sociallinks.map((value,i)=>(
                            <Link href={value.link} key={i}>
                                { (logos as any)[value?.logo] ?? logos.unkown }
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
    );
}

