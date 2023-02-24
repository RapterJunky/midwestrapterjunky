import { useId } from "react";
import Image from "next/image";
import type { ResponsiveImage } from "@type/page";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";

interface CarouselProps {
  images: ResponsiveImage<{
    alt: string | null;
    title: string | null;
  }>[];
}

export default function Carousel(props: CarouselProps) {
  const id = useId();
  const carouselId = `${id.replace(/:/g, "")}-carousel`;
  const targetId = `#${carouselId}`;

  return (
    <div id={carouselId} className="relative h-screen" data-te-carousel-init data-te-carousel-slide="carousel" data-te-interval="8000">
      <div className="absolute right-0 bottom-0 left-0 z-[2] mx-[15%] mb-4 flex list-none justify-center p-0" data-te-carousel-indicators>
        { props.images.map((_,i)=>(
           <button className="mx-[3px] box-content h-[3px] w-[30px] flex-initial cursor-pointer border-0 border-y-[10px] border-solid border-transparent bg-white bg-clip-padding p-0 -indent-[999px] opacity-50 transition-opacity duration-[600ms] ease-[cubic-bezier(0.25,0.1,0.25,1.0)] motion-reduce:transition-none" key={i} type="button"
            data-te-target={targetId}
            data-te-slide-to={i}
            data-te-carousel-active={i===0?"true":undefined}
            aria-current={i===0? "true": undefined}
            aria-label={`Slide ${i+1}`}></button>
        )) }
      </div>
      <div className="relative h-full w-full overflow-hidden after:clear-both after:block after:content-['']">
        { props.images.map((value,i)=>(
            <div key={i}
            className={"relative float-left -mr-[100%] h-full w-full transition-transform duration-[600ms] ease-in-out motion-reduce:transition-none" + (i!==0 ? " hidden":"")}
            data-te-carousel-active={i===0?"true":undefined}
            data-te-carousel-item
            style={{backfaceVisibility: "hidden"}}>
            <Image fill
              sizes={value.responsiveImage.sizes}
              blurDataURL={value.blurUpThumb}
              src={value.responsiveImage.src}
              className="block w-full h-full object-cover object-center"
              alt={value.responsiveImage?.alt ?? "Carousel Image"} />
            {value.responsiveImage.title ? (
              <div className="absolute inset-x-[15%] bottom-5 hidden py-5 text-center text-white md:block">
                <h5 className="text-xl">{value.responsiveImage.title}</h5>
                {value.responsiveImage?.alt ? (
                  <p>
                    {value.responsiveImage?.alt}
                  </p>
                ):null}
              </div>
            ) : null }
          </div>
        )) }
      </div>
      <button className="absolute top-0 bottom-0 left-0 z-[1] flex w-[8%] items-center justify-center border-0 bg-none p-0 text-center text-white opacity-50 transition-opacity duration-150 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] hover:text-white hover:no-underline hover:opacity-90 hover:outline-none focus:text-white focus:no-underline focus:opacity-90 focus:outline-none motion-reduce:transition-none" type="button" data-te-target={targetId} data-te-slide="prev">
        <span className="inline-block h-8 w-8">
          <HiChevronLeft className="h-11 w-11"/>
        </span>
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Previous</span>
      </button>
      <button className="absolute top-0 bottom-0 right-0 z-[1] flex w-[8%] items-center justify-center border-0 bg-none p-0 text-center text-white opacity-50 transition-opacity duration-150 ease-[cubic-bezier(0.25,0.1,0.25,1.0)] hover:text-white hover:no-underline hover:opacity-90 hover:outline-none focus:text-white focus:no-underline focus:opacity-90 focus:outline-none motion-reduce:transition-none" type="button" data-te-target={targetId} data-te-slide="next">
        <span className="inline-block h-8 w-8">
          <HiChevronRight className="h-11 w-11"/>
        </span>
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Next</span>
      </button>
    </div>
  );
}
