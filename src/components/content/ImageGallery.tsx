import Image from 'next/image';
import type { ResponsiveImage } from '@lib/types';

interface ImageGalleryProps {
    displayHeading: boolean;
    heading: string;
    images: ResponsiveImage<{ height: number; width: number; }>[];
}

export default function ImageGallery(props: ImageGalleryProps){
    return (
        <section className='flex flex-col items-center'>
            { props.displayHeading ?  <h1 className="font-bold text-2xl py-4 text-neutral-700">{props.heading}</h1> : null }
            <div className="flex flex-wrap h-max">
                { props.images.map((value,i)=>(
                    <div className="w-2/4 md:w-1/4 flex-grow h-full relative" key={i}>
                        <div className="relative max-h-[1454px] max-w-[2048px]">
                            <Image blurDataURL={value.blurUpThumb} width={value.responsiveImage.width} height={value.responsiveImage.height} className="object-contain object-top" src={value.responsiveImage.src} alt={value.responsiveImage?.alt ?? "Gallery Image"} sizes={value.responsiveImage.sizes}/>
                        </div>
                    </div>
                )) }
            </div>
        </section>
    );
}