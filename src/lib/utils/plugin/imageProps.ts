import type { GoogleImage } from "@/lib/api/googleDrive";
import type { ResponsiveImage } from "@/types/page";
import { GOOGLE_DRIVE_IMAGE_ROOT } from "../googleConsts";

export const getImageProps = (image: GoogleImage): ResponsiveImage<{ width: number, height: number }> => {
    return {
        blurUpThumb: image.appProperties?.blurthumb ?? "",
        responsiveImage: {
            alt: image.appProperties?.alt.length ? image.appProperties.alt : image.name,
            src: `${GOOGLE_DRIVE_IMAGE_ROOT}${image.id}`,
            sizes: image.appProperties?.sizes.length ? image.appProperties.sizes : `(max-width: ${image.imageMediaMetadata.width}px) 100vw, ${image.imageMediaMetadata.width}px`,
            width: image.imageMediaMetadata.width,
            height: image.imageMediaMetadata.height
        }
    };
}