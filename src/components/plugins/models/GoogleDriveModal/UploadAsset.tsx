import type {
  RenderModalCtx,
  RenderFieldExtensionCtx,
} from "datocms-plugin-sdk";
import { useRef, type ChangeEvent, useState } from "react";
import { Button, Spinner } from "datocms-react-ui";

import { AuthFetch } from "@/lib/utils/plugin/auth_fetch";
import type { GoogleImage } from "@/lib/api/googleDrive";

const UploadAsset: React.FC<
  React.PropsWithChildren<{
    btnType?: "primary" | "muted" | "negative";
    btnSize?: "xxs" | "xs" | "s" | "m" | "l" | "xl";
    callback: (data: GoogleImage) => void;
    ctx: RenderModalCtx | RenderFieldExtensionCtx;
  }>
> = ({ ctx, children, callback, btnSize, btnType }) => {
  const ref = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async (ev: ChangeEvent<HTMLInputElement>) => {
    const image = ev.target.files?.item(0);
    if (!image) return;
    try {
      setLoading(true);

      if (image.size > 5 * 1024 * 1024) {
        throw new Error("Image size is too large.", {
          cause: "MAX_IMAGE_SIZE",
        });
      }

      const formData = new FormData();

      formData.set("image", image, image.name);

      const response = await AuthFetch("/api/plugin/upload", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as GoogleImage;

      callback(data);

      ctx.notice("Image has been uploaded.").catch((e) => console.error(e));
    } catch (error) {
      if (error instanceof Error && error.cause === "MAX_IMAGE_SIZE") {
        ctx
          .alert(
            "Can't upload image, do to size of image. Max file size is 5MB",
          )
          .catch((e) => console.error(e));
      } else {
        ctx.alert("Failed to upload image.").catch((e) => console.error(e));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <input
        ref={ref}
        onChange={handleUpload}
        className="hidden"
        type="file"
        accept="image/*"
      />
      <Button
        type="button"
        rightIcon={loading ? <Spinner size={20} /> : null}
        disabled={loading}
        buttonType={btnType}
        buttonSize={btnSize}
        onClick={() => ref.current?.click()}
      >
        {children}
      </Button>
    </>
  );
};

export default UploadAsset;
