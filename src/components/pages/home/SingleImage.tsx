import type { ModulerContent, ResponsiveImage } from "@/types/page";
import Image from "next/image";

export interface SingleImageProps extends ModulerContent {
  content: ResponsiveImage;
}

const SingleImage: React.FC<SingleImageProps> = ({ content }) => {
  if (!content) return null;
  return (
    <section className="flex h-[50vh] justify-center p-4 md:grid md:grid-cols-3">
      <div className="relative col-span-1 col-start-2 h-full w-full">
        <Image
          fill
          loading="lazy"
          placeholder={content.blurUpThumb.length > 0 ? "blur" : "empty"}
          unoptimized={content.responsiveImage.src.startsWith(
            "https://drive.google.com",
          )}
          referrerPolicy="no-referrer"
          className="rounded-sm shadow-lg"
          alt={content.responsiveImage?.alt ?? "Section Image"}
          blurDataURL={content.blurUpThumb}
          sizes={content.responsiveImage.sizes}
          src={content.responsiveImage.src}
        />
      </div>
    </section>
  );
};

export default SingleImage;
