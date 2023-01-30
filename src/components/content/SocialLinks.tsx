import Link from 'next/link';
import type { Color, Icon } from '@lib/types';
import FontAwesomeIcon from '@components/FontAwesomeIcon';

interface SocialLinksProps {
    sociallinks: { iconColor: Color | null;  logo: Icon; link: string; }[]
}

export default function SocialLinks(props: SocialLinksProps){
    return (
        <div className="w-full top-0 h-full flex flex-col z-10">
            <div className="social bg-zinc-700 flex flex-col items-center justify-center w-full py-8">
                <h3 className="text-2xl text-white font-bold">Find us on</h3>
                <div className='flex flex-wrap gap-5 text-9xl text-[10rem] text-white py-4 justify-center'>
                    {props.sociallinks.map((value,i)=>(
                        <Link href={value.link} key={i}>
                            <FontAwesomeIcon {...value.logo} style={{ color: value.iconColor?.hex ?? "white" }}/>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}

