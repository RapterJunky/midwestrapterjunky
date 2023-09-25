import type { ModulerContent, ResponsiveImage } from '@/types/page';
import Image from 'next/image';

export interface SingleImageProps extends ModulerContent {
    content: ResponsiveImage;
}

const SingleImage: React.FC<SingleImageProps> = ({ content }) => {
    if (!content) return null;
    return (
        <section className="h-[50vh] flex justify-center md:grid md:grid-cols-3 p-4">
            <div className="relative col-span-1 col-start-2 w-full h-full">
                <Image
                    fill
                    loading="lazy"
                    placeholder={content.blurUpThumb.length > 0 ? "blur" : "empty"}
                    unoptimized={content.responsiveImage.src.startsWith("https://drive.google.com")}
                    referrerPolicy="no-referrer"
                    className="shadow-lg rounded-sm"
                    alt={content.responsiveImage?.alt ?? "Section Image"}
                    blurDataURL={content.blurUpThumb}
                    sizes={content.responsiveImage.sizes}
                    src={content.responsiveImage.src} />
            </div>
        </section>
    );
}

export default SingleImage;