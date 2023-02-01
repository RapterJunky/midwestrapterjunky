import { useId } from "react";
import Image from "next/image";
import type { ResponsiveImage } from "@type/page";

interface CarouselProps {
  images: (ResponsiveImage & {
    customData: {
      heading?: string;
      subheading?: string;
    } | null;
  })[];
}

export default function Carousel(props: CarouselProps) {
  const id = useId();
  const carouselId = `${id.replace(/:/g, "")}-carousel`;

  return (
    <div
      id={carouselId}
      className="slide carousel relative h-screen"
      data-bs-ride="carousel"
    >
      <div className="carousel-indicators absolute right-0 bottom-0 left-0 mb-4 flex justify-center p-0">
        {props.images.map((_, i) => (
          <button
            key={i}
            type="button"
            data-bs-target={`#${carouselId}`}
            data-bs-slide-to={i}
            className={i === 0 ? "active" : undefined}
            aria-current={i === 0 ? "true" : "false"}
            aria-label={`Slide ${i + 1}`}
          ></button>
        ))}
      </div>
      <div className="carousel-inner relative h-full w-full overflow-hidden">
        {props.images.map((value, i) => (
          <div
            key={i}
            className={
              "carousel-item relative float-left h-full w-full" +
              (i === 0 ? " active" : "")
            }
          >
            <Image
              blurDataURL={value.blurUpThumb}
              fill
              src={value.responsiveImage.src}
              className="block h-full w-full object-cover object-center"
              alt={value.responsiveImage?.alt ?? "Carousel Image"}
            />
            <div className="carousel-caption absolute hidden text-center md:block">
              <h5 className="text-xl font-bold">
                {value.customData?.heading ?? ""}
              </h5>
              <p>{value.customData?.subheading ?? ""}</p>
            </div>
          </div>
        ))}
      </div>
      <button
        className="carousel-control-prev absolute top-0 bottom-0 left-0 flex items-center justify-center border-0 p-0 text-center hover:no-underline hover:outline-none focus:no-underline focus:outline-none"
        type="button"
        data-bs-target={`#${carouselId}`}
        data-bs-slide="prev"
      >
        <span
          className="carousel-control-prev-icon inline-block bg-no-repeat"
          aria-hidden="true"
        ></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next absolute top-0 bottom-0 right-0 flex items-center justify-center border-0 p-0 text-center hover:no-underline hover:outline-none focus:no-underline focus:outline-none"
        type="button"
        data-bs-target={`#${carouselId}`}
        data-bs-slide="next"
      >
        <span
          className="carousel-control-next-icon inline-block bg-no-repeat"
          aria-hidden="true"
        ></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
}
