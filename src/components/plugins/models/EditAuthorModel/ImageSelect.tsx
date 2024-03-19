import type { FormState } from "./Edit";
import type { RenderModalCtx } from "datocms-plugin-sdk";
import { Button, FieldError, FormLabel } from "datocms-react-ui";
import Image from "next/image";
import { Controller, type Control } from "react-hook-form";
import { FaTrash } from "react-icons/fa";

type ImageSelectProps = {
  ctx: RenderModalCtx;
  name: string | undefined;
  control: Control<FormState>;
};

const ImageSelect: React.FC<ImageSelectProps> = ({ ctx, name, control }) => {
  return (
    <Controller
      rules={{ required: "Please Select a image" }}
      name="avatar"
      control={control}
      render={({ fieldState, field }) => (
        <div>
          <FormLabel htmlFor="avatar">Image</FormLabel>
          {field.value ? (
            <div
              id="avatar"
              className="group relative flex items-center justify-center p-2"
            >
              <div className="relative h-28 w-28">
                <Image
                  sizes="100vw"
                  src={field.value}
                  alt="Avator Image"
                  fill
                />
              </div>
              <button
                className="absolute hidden h-full w-full items-center justify-center bg-slate-400 bg-opacity-40 group-hover:flex"
                onClick={() => field.onChange("")}
              >
                <FaTrash className="h-8 w-8 text-red-600" />
              </button>
            </div>
          ) : (
            <div
              id="avatar"
              className="flex h-28 items-center justify-center gap-2 p-2"
            >
              <Button
                onClick={async () => {
                  const image = await ctx.selectUpload();
                  if (!image) return;
                  field.onChange(image.attributes.url);
                }}
                type="button"
              >
                Use Existing
              </Button>
              <Button
                onClick={() =>
                  field.onChange(
                    `https://api.dicebear.com/5.x/initials/png?seed=${encodeURIComponent(
                      name ?? "Author",
                    )}`,
                  )
                }
                type="button"
                buttonType="negative"
              >
                Use Generated
              </Button>
            </div>
          )}
          {fieldState.error?.message ? (
            <FieldError>{fieldState.error.message}</FieldError>
          ) : null}
        </div>
      )}
    />
  );
};

export default ImageSelect;
