import type { RenderAssetSourceCtx } from "datocms-plugin-sdk";
import { Button, Spinner, Canvas } from "datocms-react-ui";
import { useState, useRef } from "react";
import Image from "next/image";

import { AuthFetch } from "@lib/utils/plugin/auth_fetch";

const AssetSourceOptimized: React.FC<{
  ctx: RenderAssetSourceCtx;
}> = ({ ctx }) => {
  const [image, setImage] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const [filename, setFilename] = useState<string>();
  const selector = useRef<HTMLInputElement>(null);

  const handleSubmit = async (ev: React.FormEvent<HTMLFormElement>) => {
    try {
      ev.preventDefault();
      setLoading(true);

      if (!(selector.current?.files && selector.current?.files[0]))
        throw new Error("No files to upload.");
      const file = selector.current?.files[0];
      const data = new FormData();

      data.append("image", file, file.name);

      const req = await AuthFetch("/api/plugin/upload", {
        method: "POST",
        body: data,
      });

      const info = (await req.json()) as { base64: string; filename: string };

      ctx.select({
        resource: {
          base64: info.base64,
          filename: info.filename,
        },
      });

      await ctx.notice("Uploaded and optimized image.");
    } catch (error) {
      console.error(error);
      (ev.target as HTMLFormElement).reset();
      setImage("");
      setLoading(false);
      await ctx.alert("Failed to upload image");
    }
  };

  return (
    <Canvas ctx={ctx}>
      <form
        className="flex h-full w-full flex-col items-center justify-center gap-2"
        onSubmit={handleSubmit}
      >
        {!loading ? (
          <>
            <div className="flex h-full w-full flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <Button
                  buttonType="muted"
                  onClick={() => selector.current?.click()}
                >
                  Choose...
                </Button>
                {image ? (
                  <span className="font-serif font-thin">{filename}</span>
                ) : null}
              </div>
              <input
                ref={selector}
                multiple={false}
                onChange={(ev) => {
                  if (ev.target.files && ev?.target.files[0]) {
                    setFilename(ev.target.files[0].name);
                    setImage(URL.createObjectURL(ev.target.files[0]));
                  }
                }}
                type="file"
                name="image"
                className="hidden"
              />
              {image ? (
                <div className="relative h-48 w-full">
                  <Image
                    src={image}
                    fill
                    alt="upload iamge"
                    className="object-contain object-center"
                  />
                </div>
              ) : null}
            </div>
            {image ? (
              <Button buttonType="primary" className="w-full" type="submit">
                Upload
              </Button>
            ) : null}
          </>
        ) : (
          <div className="w-full">
            <Spinner size={48} placement="centered" />
          </div>
        )}
      </form>
    </Canvas>
  );
};

export default AssetSourceOptimized;
