import { useId } from "react";
import Image from 'next/image';
import type { ResponsiveImage } from "../../lib/types";

interface CarouselProps {
    images: (ResponsiveImage & {
        customData: {
            heading?: string;
            subheading?: string;
        } | null
    })[]
}

export default function Carousel(props: CarouselProps){
    const carouselId = useId();

    return (
        <div id={`${carouselId.replace(/:/g,"")}-carousel`} className="carousel slide relative h-screen" data-bs-ride="carousel">
            <div className="carousel-indicators absolute right-0 bottom-0 left-0 flex justify-center p-0 mb-4">
                {props.images.map((_,i)=>(
                    <button key={i} type="button" data-bs-target={`#${carouselId.replace(/:/g,"")}-carousel`} data-bs-slide-to={i} className={i === 0 ? "active" : undefined} aria-current={ i === 0 ? "true" : "false"} aria-label={`Slide ${i+1}`}></button>
                ))}
            </div>
            <div className="carousel-inner relative w-full overflow-hidden h-full">
                {props.images.map((value,i)=>(
                    <div key={i} className={"carousel-item relative float-left w-full h-full" + (i === 0 ? " active" : "")}>
                        <Image blurDataURL={value.blurUpThumb} fill src={value.responsiveImage.src} className="block w-full h-full object-cover object-center" alt={value.responsiveImage?.alt ?? "Carousel Image"}/>
                        <div className="carousel-caption hidden md:block absolute text-center">
                            <h5 className="text-xl font-bold">{value.customData?.heading ?? ""}</h5>
                            <p>{value.customData?.subheading ?? ""}</p>
                        </div>
                    </div>
                ))}
            </div>
            <button className="carousel-control-prev absolute top-0 bottom-0 flex items-center justify-center p-0 text-center border-0 hover:outline-none hover:no-underline focus:outline-none focus:no-underline left-0"
                type="button"
                data-bs-target={`#${carouselId.replace(/:/g,"")}-carousel`}
                data-bs-slide="prev"
            >
                <span className="carousel-control-prev-icon inline-block bg-no-repeat" aria-hidden="true"></span>
                <span className="visually-hidden">Previous</span>
            </button>
            <button className="carousel-control-next absolute top-0 bottom-0 flex items-center justify-center p-0 text-center border-0 hover:outline-none hover:no-underline focus:outline-none focus:no-underline right-0"
                type="button"
                data-bs-target={`#${carouselId.replace(/:/g,"")}-carousel`}
                data-bs-slide="next"
            >
                <span className="carousel-control-next-icon inline-block bg-no-repeat" aria-hidden="true"></span>
                <span className="visually-hidden">Next</span>
            </button>
        </div>
    );
}