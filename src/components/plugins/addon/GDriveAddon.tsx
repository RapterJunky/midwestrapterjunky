import type { ResponsiveImage } from "@type/page";
import type { RenderFieldExtensionCtx } from "datocms-plugin-sdk";
import { Canvas, Button } from "datocms-react-ui";
import get from "lodash.get";
import Image from "next/image";
import { FaGoogleDrive } from "react-icons/fa";

const GDriveAddon: React.FC<{ ctx: RenderFieldExtensionCtx }> = ({ ctx }) => {

  const data = JSON.parse(get(ctx.formValues as never as object, ctx.fieldPath, "[]")) as ResponsiveImage[];

  return (
    <Canvas ctx={ctx}>
      <Button
        onClick={async () => {
          await ctx.openModal({
            id: "gDriveModel",
            title: "Choose from Google Drive",
            width: "xl",
          });

          console.log(ctx.fieldPath, ctx.formValues);
        }}
        leftIcon={<FaGoogleDrive />}
        buttonSize="xxs"
      >
        From Google Drive
      </Button>

      <div className="flex flex-wrap">
        {data.map((image, i) => (
          <div key={i}>
            <Image height={100} width={100} sizes={image.responsiveImage.sizes} placeholder={image.blurUpThumb.length ? "blur" : "empty"} src={image.responsiveImage.src} alt={image.responsiveImage.alt ?? "GDrive Image"} blurDataURL={image.blurUpThumb} />
          </div>
        ))}
      </div>
    </Canvas>
  );
};

export default GDriveAddon;
