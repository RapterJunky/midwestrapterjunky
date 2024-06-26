import Parallax from "./Parallax";
import { Star } from "lucide-react";
import Link from "next/link";
import {
  StructuredText,
  type StructuredTextGraphQlResponse,
} from "react-datocms/structured-text";
import { Button } from "@/components/ui/button";
import { markRules } from "@lib/structuredTextRules";
import type { Color, ModulerContent, ResponsiveImage } from "@type/page";

export interface TestimonialAndShareProps extends ModulerContent {
  description: StructuredTextGraphQlResponse;
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

const TestimonialAndShare: React.FC<TestimonialAndShareProps> = (props) => {
  return (
    <section className="relative">
      <div className="absolute top-0 z-10 flex h-full w-full flex-col">
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
                    <Star key={key} />
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
          <Button asChild>
            <Link href={props.buttonlink}>{props.linkTitle}</Link>
          </Button>
        </div>
      </div>
      <Parallax background={props.bgImage} />
    </section>
  );
};
export default TestimonialAndShare;
