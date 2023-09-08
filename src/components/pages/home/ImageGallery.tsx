import Image from "next/image";
import type { ModulerContent, ResponsiveImage } from "@type/page";

export interface ImageGalleryProps extends ModulerContent {
  displayHeading: boolean;
  heading: string;
  images: ResponsiveImage<{ height: number; width: number }>[];
}

export default function ImageGallery(props: ImageGalleryProps) {
  return (
    <section className="flex flex-col items-center">
      {props.displayHeading ? (
        <h1 className="my-4 py-4 text-2xl font-bold text-neutral-700 md:text-4xl">
          {props.heading}
        </h1>
      ) : null}
      <div className="flex h-max flex-wrap bg-zinc-100">
        {props.images.map((value, i) => (
          <div className="relative h-full w-2/4 flex-grow md:w-1/4" key={i}>
            <div className="relative max-h-[1454px] max-w-[2048px]">
              <Image
                referrerPolicy="no-referrer"
                placeholder="blur"
                loading="lazy"
                blurDataURL={value.blurUpThumb}
                width={value.responsiveImage.width}
                height={value.responsiveImage.height}
                className="object-contain object-top"
                src={value.responsiveImage.src}
                alt={value.responsiveImage?.alt ?? "Gallery Image"}
                sizes={value.responsiveImage.sizes}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
