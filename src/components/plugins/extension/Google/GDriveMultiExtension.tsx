import UploadAsset from "../../models/GoogleDriveModal/UploadAsset";
import SelectedImage from "./SelectedImage";
import type { RenderFieldExtensionCtx } from "datocms-plugin-sdk";
import { Button, Canvas } from "datocms-react-ui";
import update from "immutability-helper";
import get from "lodash.get";
import { useState } from "react";
import { FaGoogleDrive, FaPlus } from "react-icons/fa";
import { getImageProps } from "@/lib/utils/plugin/imageProps";
import type { ResponsiveImage } from "@type/page";

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
      initialHeight:
        window.screen.availHeight - window.screen.availHeight * 0.05 - 105, // 710,
      parameters: {
        height:
          window.screen.availHeight - window.screen.availHeight * 0.05 - 100,
        maxAssets: ctx.parameters.maxAssets ?? Infinity,
        minAssets: ctx.parameters.minAssets ?? 1,
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
        <div className="mb-4 grid grid-cols-3 items-center gap-dato-m">
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
        <div className="mb-dato-m flex gap-dato-s">
          <UploadAsset
            callback={(data) => {
              setImages((current) => {
                const nextData = [...current, getImageProps(data)];
                return nextData;
              });
            }}
            ctx={ctx}
            btnSize="xs"
          >
            <span className="flex items-center justify-center gap-dato-s">
              <FaPlus />
              Upload File
            </span>
          </UploadAsset>
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
