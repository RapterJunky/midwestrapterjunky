import { ChevronLeft, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useId } from "react";

import type { ModulerContent, ResponsiveImage } from "@type/page";
import { cn } from "@/lib/utils";

export interface CarouselProps extends ModulerContent {
  images: ResponsiveImage<{
    alt: string | null;
    title: string | null;
  }>[];
}

const CarouselRuntime = dynamic(() => import("./CarouselRuntime"), {
  ssr: false,
});

export default function CarouselElement(props: CarouselProps) {
  const id = useId();

  const carouselId = `${id.replaceAll(":", "")}-carousel`;

  return (
    <section className="relative h-screen w-full" id={carouselId}>
      <CarouselRuntime id={carouselId} />
      <div
        className="absolute bottom-0 left-0 right-0 z-[22] mx-[15%] mb-4 flex list-none justify-center p-0"
        data-carousel-indicators
      >
        {props.images.map((_, i) => (
          <button
            className="mx-[3px] box-content h-[3px] w-[30px] flex-initial cursor-pointer border-0 border-y-[10px] border-solid border-transparent bg-white bg-clip-padding p-0 -indent-[999px] opacity-50 transition-opacity duration-500 ease-in aria-[current='true']:opacity-100 motion-reduce:transition-none"
            key={i}
            aria-current={i === 0 ? "true" : "false"}
            type="button"
            aria-label={`Slide ${i + 1}`}
          ></button>
        ))}
      </div>
      <button
        className="ease-[cubic-bezier(0.25,0.1,0.25,1.0)] absolute bottom-0 left-0 top-0 z-[21] flex w-[15%] items-center justify-center border-0 bg-none p-0 text-center text-white opacity-50 transition-opacity duration-150 hover:text-white hover:no-underline hover:opacity-90 hover:outline-none focus:text-white focus:no-underline focus:opacity-90 focus:outline-none motion-reduce:transition-none"
        type="button"
        data-carousel-prev
      >
        <span className="inline-block h-8 w-8">
          <ChevronLeft className="h-11 w-11" />
        </span>
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Previous
        </span>
      </button>
      <button
        data-carousel-next
        className="ease-[cubic-bezier(0.25,0.1,0.25,1.0)] absolute bottom-0 right-0 top-0 z-[21] flex w-[15%] items-center justify-center border-0 bg-none p-0 text-center text-white opacity-50 transition-opacity duration-150 hover:text-white hover:no-underline hover:opacity-90 hover:outline-none focus:text-white focus:no-underline focus:opacity-90 focus:outline-none motion-reduce:transition-none"
        type="button"
      >
        <span className="inline-block h-8 w-8">
          <ChevronRight className="h-11 w-11" />
        </span>
        <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
          Next
        </span>
      </button>
      <div className="relative h-full overflow-hidden" data-carousel-container>
        {props.images.map((value, i) => (
          <div
            key={i}
            className={cn(
              "absolute inset-0 h-full transform transition-transform duration-700 ease-in-out",
              { hidden: i !== 0 },
            )}
          >
            <Image
              referrerPolicy="no-referrer"
              placeholder="blur"
              loading="lazy"
              fill
              sizes={value.responsiveImage.sizes}
              blurDataURL={value.blurUpThumb}
              src={value.responsiveImage.src}
              className="pointer-events-none block h-full w-full select-none object-cover object-center"
              alt={value.responsiveImage?.alt ?? "Carousel Image"}
            />
            {value.responsiveImage.title ? (
              <div className="absolute inset-x-[15%] bottom-5 hidden py-5 text-center text-white md:block">
                <h5 className="text-xl">{value.responsiveImage.title}</h5>
                {value.responsiveImage?.alt ? (
                  <p>{value.responsiveImage?.alt}</p>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
