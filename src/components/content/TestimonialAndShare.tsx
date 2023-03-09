import Image from "next/image";
import { StructuredText } from "react-datocms/structured-text";
import { Parallax, Background } from "react-parallax";
import { HiStar } from "react-icons/hi";
import Button from "@components/Button";
import { markRules } from "@lib/structuredTextRules";
import type { Color, ResponsiveImage, StructuredContent } from "@type/page";

interface TestimonialAndShareProps {
  description: StructuredContent;
  bgImage: ResponsiveImage;
  linkTitle: string;
  bgColor: Color;
  buttonlink: string;
  testimonials: {
    qoute: string;
    rating: number;
    author: string;
  }[];
}

export default function TestimonialAndShare(props: TestimonialAndShareProps) {
  return (
    <div className="relative">
      <div className="absolute top-0 z-40 flex h-full w-full flex-col">
        <div
          className="flex flex-col items-center justify-center gap-10 py-8"
          style={{ backgroundColor: props.bgColor.hex }}
        >
          <h2 className="text-3xl font-semibold text-white">Testimonials</h2>
          <div className="flex flex-wrap">
            {props.testimonials.map((value, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-5 text-white"
              >
                <div className="flex gap-1 text-xl">
                  {Array.from({ length: value.rating }, (_, key) => (
                    <HiStar key={key} />
                  ))}
                </div>
                <q className="font-serif font-normal">{value.qoute}</q>
                <span className="text-sm font-semibold">{value.author}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-grow flex-col items-center justify-center gap-3 px-2 text-center text-white">
          <StructuredText
            customMarkRules={markRules}
            data={props.description}
          />
          <Button href={props.buttonlink} link>
            {props.linkTitle}
          </Button>
        </div>
      </div>
      <Parallax className="h-screen">
        <Background className="relative h-screen w-screen">
          <Image
            blurDataURL={props.bgImage.blurUpThumb}
            sizes={props.bgImage.responsiveImage.sizes}
            src={props.bgImage.responsiveImage.src}
            alt={props.bgImage.responsiveImage?.alt ?? "parallax background"}
            className="h-full w-full object-cover object-top"
            fill
          />
        </Background>
      </Parallax>
    </div>
  );
}
