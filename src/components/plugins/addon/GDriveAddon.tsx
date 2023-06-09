import type { RenderFieldExtensionCtx } from "datocms-plugin-sdk";
import { Canvas, Button } from "datocms-react-ui";
import { FaGoogleDrive } from "react-icons/fa";
import update from "immutability-helper";
import { useState } from "react";
import Image from "next/image";
import get from "lodash.get";

import type { ResponsiveImage } from "@type/page";

const SelectedImage: React.FC<{
  drop: () => void;
  onDrop: (from: number, to: number) => void;
  idx: number;
  image: ResponsiveImage<{ width: number; height: number }>;
}> = ({ image, drop, idx, onDrop }) => {
  return (
    <div
      onDrop={(ev) => {
        ev.preventDefault();
        const fromIndex = parseInt(ev.dataTransfer.getData("index"));
        onDrop(fromIndex, idx);
      }}
      onDragOver={(ev) => ev.preventDefault()}
      onDragStart={(ev) => ev.dataTransfer.setData("index", idx.toString())}
      draggable
      className="group relative flex h-32 w-56 cursor-move items-center justify-center rounded-md border border-dato-border bg-dato-lighter shadow hover:border-dato-darker"
    >
      <div className="absolute hidden items-center justify-center rounded-sm bg-white py-2 shadow group-hover:flex">
        <button
          className="w-full px-4 py-0.5 text-lg hover:bg-dato-light hover:text-dato-alert"
          onClick={drop}
        >
          Remove
        </button>
      </div>
      <Image
        height={100}
        width={100}
        sizes={image.responsiveImage.sizes}
        placeholder={image.blurUpThumb.length ? "blur" : "empty"}
        src={image.responsiveImage.src}
        alt={image.responsiveImage.alt ?? "GDrive Image"}
        blurDataURL={image.blurUpThumb}
      />
    </div>
  );
};

const GDriveAddon: React.FC<{ ctx: RenderFieldExtensionCtx }> = ({ ctx }) => {
  const [images, setImages] = useState<
    ResponsiveImage<{ width: number; height: number }>[]
  >(
    JSON.parse(
      get(ctx.formValues as never as object, ctx.fieldPath, "[]")
    ) as ResponsiveImage[]
  );

  const selectImages = async () => {
    const data = (await ctx.openModal({
      id: "gDriveModel",
      closeDisabled: true,
      width: "fullWidth",
      parameters: {
        max: ctx.parameters.maxAssets ?? Infinity,
        current: images.length,
        limit: ctx.parameters.limitAssets
      }
    })) as
      | ResponsiveImage<{ width: number; height: number }>
      | ResponsiveImage<{ width: number; height: number }>[]
      | null;
    if (!data) return;

    setImages((current) => {
      const next = [...current];
      if (Array.isArray(data)) {
        next.push(...data);
      } else {
        next.push(data);
      }
      ctx
        .setFieldValue(ctx.fieldPath, JSON.stringify(next))
        .catch((e) => console.error(e));
      return next;
    });
  }

  return (
    <Canvas ctx={ctx}>
      <div className="flex flex-col gap-dato-m">
        <div className="flex flex-wrap items-center gap-dato-m mb-4">
          {images.map((image, i) => (
            <SelectedImage
              onDrop={(from, to) => {
                setImages((current) => {
                  const copy = [...current];
                  const copyTo = copy[to];
                  const copyFrom = copy[from];
                  if (!copyTo || !copyFrom) return current;

                  copy.splice(from, 1, copyTo);
                  copy.splice(to, 1, copyFrom);

                  ctx
                    .setFieldValue(ctx.fieldPath, JSON.stringify(copy))
                    .catch((e) => console.error(e));
                  return copy;
                });
              }}
              idx={i}
              key={i}
              image={image}
              drop={() =>
                setImages((current) => {
                  const data = update(current, { $splice: [[i, 1]] });
                  ctx
                    .setFieldValue(ctx.fieldPath, JSON.stringify(data))
                    .catch((e) => console.error(e));
                  return data;
                })
              }
            />
          ))}
        </div>
        <div className="flex gap-dato-s justify-center mb-dato-m">
          <Button
            onClick={selectImages}
            buttonSize="xs"
          >
            <span className="flex items-center justify-center gap-dato-s">
              <FaGoogleDrive />
              From Google Drive
            </span>
          </Button>
        </div>
      </div>
    </Canvas>
  );
};

export default GDriveAddon;
