import Image from 'next/image';

interface ImageGalleryProps {
    displayHeading: boolean;
    heading: string;
    images: {
        blurUpThumb: string;
        url: string;
        alt: string | null;
        height: number;
        width: number;
        responsiveImage: {
            sizes: string;
          }
    }[];
}

export default function ImageGallery(props: ImageGalleryProps){
    return (
        <section className='flex flex-col items-center'>
            { props.displayHeading ?  <h1 className="font-bold text-2xl py-4 text-neutral-700">{props.heading}</h1> : null }
            <div className="flex flex-wrap h-max">
                { props.images.map((value,i)=>(
                    <div className="w-2/4 md:w-1/4 flex-grow h-full relative" key={i}>
                        <div className="relative max-h-[1454px] max-w-[2048px]">
                            <Image blurDataURL={value.blurUpThumb} width={value.width} height={value.height} className="object-contain object-top" src={value.url} alt={value.alt ?? "Gallery Image"} sizes={value.responsiveImage.sizes}/>
                        </div>
                    </div>
                )) }
            </div>
        </section>
    );
}