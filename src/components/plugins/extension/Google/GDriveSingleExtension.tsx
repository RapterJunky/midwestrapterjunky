import UploadAsset from "../../models/GoogleDriveModal/UploadAsset";
import SelectedImage from "./SelectedImage";
import type { RenderFieldExtensionCtx } from "datocms-plugin-sdk";
import { Button, Canvas } from "datocms-react-ui";
import get from "lodash.get";
import { useState } from "react";
import { FaGoogleDrive, FaPlus } from "react-icons/fa";
import { getImageProps } from "@/lib/utils/plugin/imageProps";
import type { ResponsiveImage } from "@type/page";

const GDriveSingleExtension: React.FC<{ ctx: RenderFieldExtensionCtx }> = ({
  ctx,
}) => {
  const [image, setImage] = useState<ResponsiveImage<{
    width: number;
    height: number;
  }> | null>(
    JSON.parse(
      get(ctx.formValues, ctx.fieldPath, "null") as string,
    ) as ResponsiveImage<{ width: number; height: number }> | null,
  );
  const selectImage = async () => {
    const data = (await ctx.openModal({
      id: "gDriveModel",
      closeDisabled: true,
      width: "fullWidth",
      initialHeight:
        window.screen.availHeight - window.screen.availHeight * 0.05 - 105,
      parameters: {
        height:
          window.screen.availHeight - window.screen.availHeight * 0.05 - 100,
        maxAssets: 1,
        minAssets: 1,
        current: image ? 1 : 0,
        limitAssets: true,
      },
    })) as
      | ResponsiveImage<{ width: number; height: number }>
      | ResponsiveImage<{ width: number; height: number }>[]
      | null;
    if (!data) return;

    if (Array.isArray(data)) {
      const item = data.at(0);
      if (!item) return;
      ctx
        .setFieldValue(ctx.fieldPath, JSON.stringify(item))
        .catch((e) => console.error(e));
      setImage(item);
      return;
    }

    ctx
      .setFieldValue(ctx.fieldPath, JSON.stringify(data))
      .catch((e) => console.error(e));
    setImage(data);
  };

  return (
    <Canvas ctx={ctx}>
      <div className="flex flex-col gap-dato-m">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-dato-m">
          {image ? (
            <SelectedImage
              idx={0}
              onDrop={() => console.info("Drop")}
              drop={() => {
                setImage(null);
                ctx
                  .setFieldValue(ctx.fieldPath, null)
                  .catch((e) => console.error(e));
              }}
              image={image}
            />
          ) : null}
        </div>
        <div className="mb-dato-m flex gap-dato-s">
          <UploadAsset
            callback={(data) => setImage(getImageProps(data))}
            ctx={ctx}
            btnSize="xs"
          >
            <span className="flex items-center justify-center gap-dato-s">
              <FaPlus />
              Upload File
            </span>
          </UploadAsset>
          <Button onClick={selectImage} buttonSize="xs">
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

export default GDriveSingleExtension;
