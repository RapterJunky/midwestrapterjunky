import type { RenderFieldExtensionCtx } from "datocms-plugin-sdk";
import { Canvas, Button } from "datocms-react-ui";
import { FaGoogleDrive } from "react-icons/fa";
import update from "immutability-helper";
import { useState } from "react";
import get from "lodash.get";

import type { ResponsiveImage } from "@type/page";
import SelectedImage from "./SelectedImage";

const GDriveAddon: React.FC<{ ctx: RenderFieldExtensionCtx }> = ({ ctx }) => {
  const [images, setImages] = useState<
    ResponsiveImage<{ width: number; height: number }>[]
  >(
    JSON.parse(
      get(ctx.formValues as never as object, ctx.fieldPath, "[]"),
    ) as ResponsiveImage[],
  );

  const selectImages = async () => {
    const data = (await ctx.openModal({
      id: "gDriveModel",
      closeDisabled: true,
      width: "fullWidth",
      parameters: {
        maxAssets: ctx.parameters.maxAssets ?? Infinity,
        minAssets: ctx.parameters.minAssets ?? Infinity,
        current: images ? images.length : 0,
        limitAssets: ctx.parameters.limitAssets,
      },
    })) as
      | ResponsiveImage<{ width: number; height: number }>
      | ResponsiveImage<{ width: number; height: number }>[]
      | null;
    if (!data) return;

    setImages((current) => {
      const next = current ? [...current] : [];
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
  };

  return (
    <Canvas ctx={ctx}>
      <div className="flex flex-col gap-dato-m">
        <div className="mb-4 flex flex-wrap items-center gap-dato-m">
          {(images ?? []).map((image, i) => (
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
        <div className="mb-dato-m flex justify-center gap-dato-s">
          <Button onClick={selectImages} buttonSize="xs">
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
