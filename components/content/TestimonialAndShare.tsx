import { StructuredText } from "react-datocms";
import { Parallax, Background } from 'react-parallax';
import { HiStar } from 'react-icons/hi';
import Button from '../Button';
import { markRules } from '../../lib/StructuredTextRules';
import type { Color, ResponsiveImage, StructuredContent } from "../../lib/types";
import Image from "next/image";

interface TestimonialAndShareProps { 
    description: StructuredContent;
    bgImage: ResponsiveImage
    linkTitle: string;
    bgColor: Color
    buttonlink: string;
    testimonials: { 
        qoute: string;
        rating: number;
        author: string;
    }[]
}

export default function TestimonialAndShare(props: TestimonialAndShareProps){
    return (
        <div className="relative">
            <div className="absolute top-0 z-40 w-full h-full flex flex-col">
                <div className="flex flex-col justify-center items-center gap-10 py-8" style={{ backgroundColor: props.bgColor.hex }}>
                    <h2 className="text-white text-3xl font-semibold">Testimonials</h2>
                    <div className="flex flex-wrap">
                        {props.testimonials.map((value,i)=>(
                            <div key={i} className="flex flex-col text-white items-center gap-5">
                                <div className="flex text-xl gap-1">
                                    {Array.from({ length: value.rating },(_,key)=>(<HiStar key={key}/>)) }
                                </div>
                                <q className="font-serif font-normal">{value.qoute}</q>
                                <span className="font-semibold text-sm">{value.author}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col flex-grow justify-center items-center text-white gap-3 px-2 text-center">
                    <StructuredText customMarkRules={markRules} data={props.description}/>
                    <Button href={props.buttonlink} link>{props.linkTitle}</Button>
                </div>
            </div>
            <Parallax className="h-screen">
                <Background className="h-screen w-screen relative">
                    <Image blurDataURL={props.bgImage.blurUpThumb} sizes={props.bgImage.responsiveImage.sizes} src={props.bgImage.responsiveImage.src} alt={props.bgImage.responsiveImage?.alt ?? "parallax background"} className="h-full w-full object-cover object-top" fill/>
                </Background>
            </Parallax>
        </div>
    );
}