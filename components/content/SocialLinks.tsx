import Link from 'next/link';
import * as FAIcons from 'react-icons/fa';
import type { Color, Icon } from '../../lib/types';

interface SocialLinksProps {
    sociallinks: { iconColor: Color | null;  logo: Icon; link: string; }[]
}

export default function SocialLinks(props: SocialLinksProps){
    return (
        <div className="w-full top-0 h-full flex flex-col z-10">
                <div className="social bg-zinc-700 flex flex-col items-center justify-center w-full py-8">
                    <h3 className="text-2xl text-white font-bold">Find us on</h3>
                    <div className='flex flex-wrap gap-5 text-9xl text-[10rem] text-white py-4 justify-center'>
                        {props.sociallinks.map((value,i)=>{
                            const name = value.logo.iconName.replace(/(\b\w)/g, letter => letter.toUpperCase()).replace("-","");

                            const Icon = (FAIcons as any)[`Fa${name}`] ?? FAIcons.FaQuestion;

                            return (
                                <Link href={value.link} key={i}>
                                    <Icon style={{ color: value.iconColor?.hex ?? "white" }}/>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>
    );
}

