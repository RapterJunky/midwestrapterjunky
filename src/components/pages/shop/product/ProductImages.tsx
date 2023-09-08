"use client";
import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ProductImages: React.FC<{
  name: string;
  images: { url: string; alt: string }[];
}> = ({ name, images }) => {
  const [selected, setSelected] = useState(0);
  const [dir, setDir] = useState<"slide-in-from-left" | "slide-in-from-right">(
    "slide-in-from-left",
  );

  const image = images.at(selected) ?? {
    url: `https://api.dicebear.com/6.x/icons/png?seed=${name}`,
    alt: "Product Image",
  };

  return (
    <div className="flex flex-col justify-center">
      <div className="relative flex flex-1 justify-center overflow-hidden">
        <Image
          className={`block h-full max-w-full object-contain transition-transform animate-in ${dir}`}
          src={image.url}
          alt={image.alt}
          style={{ animationDuration: "400ms" }}
          height={600}
          width={600}
          sizes="((min-width: 50em) and (max-width: 60em)) 50em, ((min-width: 30em) and (max-width: 50em)) 30em, (max-width: 30em) 20em"
        />
        <div className="absolute bottom-6 right-6 divide-x divide-zinc-900 border border-zinc-900">
          <button
            aria-label="Previous Product Image"
            type="button"
            className="px-9 py-2 hover:bg-zinc-900 hover:bg-opacity-20"
            onClick={() =>
              setSelected((current) => {
                const next = current - 1;
                if (next < 0) return images.length - 1 ?? 0;
                setDir("slide-in-from-left");
                return next;
              })
            }
          >
            <ChevronLeft className="h-8 w-8" />
          </button>
          <button
            aria-label="Next Product Image"
            type="button"
            className="px-9 py-2 hover:bg-zinc-900 hover:bg-opacity-20"
            onClick={() =>
              setSelected((current) => {
                const next = current + 1;
                if (next >= images.length) return 0;
                setDir("slide-in-from-right");
                return next;
              })
            }
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>
      </div>
      <div className="h-32 w-full overflow-hidden bg-black bg-opacity-20">
        {!images?.length ? (
          <button
            type="button"
            className="h-full w-60 cursor-pointer overflow-hidden bg-zinc-300 bg-opacity-50 animate-in slide-in-from-right"
          >
            <Image
              className="block h-full w-full max-w-full object-contain transition-transform hover:scale-110 hover:transform"
              src={image.url}
              alt={image.alt}
              height={600}
              width={600}
              sizes="((min-width: 50em) and (max-width: 60em)) 50em, ((min-width: 30em) and (max-width: 50em)) 30em, (max-width: 30em) 20em"
            />
          </button>
        ) : (
          images?.map((item, i) => (
            <button
              data-headlessui-state={selected === i ? "selected" : undefined}
              type="button"
              key={i}
              className="h-full w-60 cursor-pointer overflow-hidden ui-selected:bg-gray-300 ui-selected:bg-opacity-50"
              onClick={() => setSelected(i)}
            >
              <Image
                className="block h-full w-full max-w-full object-contain transition-transform hover:scale-110 hover:transform"
                src={item.url}
                alt={item.alt}
                height={600}
                width={600}
                sizes="((min-width: 50em) and (max-width: 60em)) 50em, ((min-width: 30em) and (max-width: 50em)) 30em, (max-width: 30em) 20em"
              />
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductImages;
