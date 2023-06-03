import type { ResponsiveImage } from "@type/page";
import type { RenderFieldExtensionCtx } from "datocms-plugin-sdk";
import { Canvas, Button } from "datocms-react-ui";
import get from "lodash.get";
import Image from "next/image";
import { useState } from "react";
import { FaGoogleDrive } from "react-icons/fa";

type GoogleImage = {
  id: string;
  name: string;
  appProperties: {
    alt: string;
    blurthumb: string;
  }
}

const GDriveAddon: React.FC<{ ctx: RenderFieldExtensionCtx }> = ({ ctx }) => {
  const [images, setImages] = useState<ResponsiveImage[]>(JSON.parse(get(ctx.formValues as never as object, ctx.fieldPath, "[]")) as ResponsiveImage[]);

  return (
    <Canvas ctx={ctx}>
      <div className="flex flex-wrap gap-2">
        {images.map((image, i) => (
          <div key={i} className="shadow">
            <Image height={100} width={100} sizes={image.responsiveImage.sizes} placeholder={image.blurUpThumb.length ? "blur" : "empty"} src={image.responsiveImage.src} alt={image.responsiveImage.alt ?? "GDrive Image"} blurDataURL={image.blurUpThumb} />
          </div>
        ))}
        <div>
          <Button
            onClick={async () => {
              const data = await ctx.openModal({
                id: "gDriveModel",
                title: "Choose from Google Drive",
                width: "xl",
              }) as GoogleImage | null;
              if (!data) return;

              setImages((current) => {


                return [...current, {
                  blurUpThumb: data.appProperties.blurthumb,
                  responsiveImage: {
                    sizes: "",
                    alt: data.appProperties.alt,
                    src: `https://drive.google.com/uc?id=${data.id}`
                  }
                }]
              });
            }}
            buttonSize="xxs"
          >
            <FaGoogleDrive />
          </Button>
        </div>
      </div>
    </Canvas>
  );
};

export default GDriveAddon;
