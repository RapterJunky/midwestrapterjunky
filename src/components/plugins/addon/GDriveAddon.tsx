import type { RenderFieldExtensionCtx } from "datocms-plugin-sdk";
import { FaPlus, FaTrash } from "react-icons/fa";
import { Canvas, Button } from "datocms-react-ui";
import update from 'immutability-helper'
import { useState } from "react";
import Image from "next/image";
import get from "lodash.get";

import type { ResponsiveImage } from "@type/page";

const SelectedImage: React.FC<{ drop: () => void, image: ResponsiveImage<{ width: number; height: number }> }> = ({ image, drop }) => {
  return (
    <div className="shadow relative group">
      <div className="hidden group-hover:flex items-center justify-center gap-2 absolute w-full h-full bg-opacity-80 bg-neutral-600">
        <Button buttonType="negative" buttonSize="xs" onClick={drop}>
          <FaTrash />
        </Button>
      </div>
      <Image height={100} width={100} sizes={image.responsiveImage.sizes} placeholder={image.blurUpThumb.length ? "blur" : "empty"} src={image.responsiveImage.src} alt={image.responsiveImage.alt ?? "GDrive Image"} blurDataURL={image.blurUpThumb} />
    </div>
  );
}

const GDriveAddon: React.FC<{ ctx: RenderFieldExtensionCtx }> = ({ ctx }) => {
  const [images, setImages] = useState<ResponsiveImage<{ width: number; height: number }>[]>(JSON.parse(get(ctx.formValues as never as object, ctx.fieldPath, "[]")) as ResponsiveImage[]);

  return (
    <Canvas ctx={ctx}>
      <div className="flex flex-wrap gap-2 items-center">
        {images.map((image, i) => (
          <SelectedImage key={i} image={image} drop={() => setImages(current => {
            const data = update(current, { $splice: [[i, 1]] });
            ctx.setFieldValue(ctx.fieldPath, JSON.stringify(data)).catch(e => console.error(e));
            return data;
          })} />
        ))}
        <div>
          <Button
            onClick={async () => {
              const data = await ctx.openModal({
                id: "gDriveModel",
                closeDisabled: true,
                width: "fullWidth"
              }) as ResponsiveImage<{ width: number; height: number }> | null;
              if (!data) return;

              setImages((current) => {
                const next = [...current, data];
                ctx.setFieldValue(ctx.fieldPath, JSON.stringify(next)).catch(e => console.error(e));
                return next;
              });
            }}
            buttonSize="l"
            buttonType="primary"
          >
            <FaPlus />
          </Button>
        </div>
      </div>
    </Canvas>
  );
};

export default GDriveAddon;
