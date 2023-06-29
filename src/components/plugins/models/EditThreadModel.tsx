import {
  Canvas,
  TextField,
  Button,
  FormLabel,
  SwitchField,
  Form,
  FieldError,
} from "datocms-react-ui";
import type { RenderModalCtx } from "datocms-plugin-sdk";
import { useForm, Controller } from "react-hook-form";
import Image from "next/image";
import TagInput from "@/components/TagInput";

interface State {
  name: string;
  description: string;
  allowUserPosts: boolean;
  id: number;
  tags: string[];
  image: string;
}

const generateImage = () =>
  `https://api.dicebear.com/6.x/shapes/png?seed=${
    crypto.randomUUID().split("-")[0]
  }`;

const EditThreadModel: React.FC<{ ctx: RenderModalCtx }> = ({ ctx }) => {
  const {
    control,
    handleSubmit,
    register,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<State>({
    defaultValues: {
      name:
        ctx.parameters.type === "edit"
          ? (ctx.parameters as { data: State })?.data.name
          : "",
      allowUserPosts:
        ctx.parameters.type === "edit"
          ? (ctx.parameters as { data: State })?.data.allowUserPosts
          : true,
      description:
        ctx.parameters.type === "edit"
          ? (ctx.parameters as { data: State })?.data.description
          : "",
      tags:
        ctx.parameters.type === "edit"
          ? (ctx.parameters as { data: State })?.data.tags ?? []
          : [],
      id:
        ctx.parameters.type === "edit"
          ? (ctx.parameters as { data: State })?.data.id
          : -1,
      image:
        ctx.parameters.type === "edit"
          ? (ctx.parameters as { data: State })?.data.image
          : generateImage(),
    },
  });
  const onSubmit = (state: State) => ctx.resolve(state);
  return (
    <Canvas ctx={ctx}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          rules={{ required: "A name is required." }}
          control={control}
          name="name"
          render={({
            fieldState: { error },
            field: { onChange, value, name },
          }) => (
            <TextField
              required
              placeholder="name"
              error={error?.message}
              id="name"
              name={name}
              label="Category Name"
              value={value}
              onChange={onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="allowUserPosts"
          render={({ field, fieldState }) => (
            <SwitchField
              id={field.name}
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              label="Users allowed to post."
              hint="Are users allowed to create a post in this category."
              error={fieldState.error?.message}
            />
          )}
        />
        <div className="mt-dato-l">
          <FormLabel
            required
            error={!!errors.description}
            htmlFor="description"
          >
            <span>Category Description</span>
          </FormLabel>
          <textarea
            className={`w-full border placeholder:text-dato-placeholder ${
              errors.description
                ? "border-dato-alert focus:border-dato-alert focus:shadow-[0_0_0_3px_rgba(var(--alert-color-rgb-components),.2)]"
                : "border-dato-border focus:border-dato-accent focus:shadow-[0_0_0_3px_var(--semi-transparent-accent-color)]"
            } text-dato-m focus:outline-0 focus:ring-0`}
            placeholder="description"
            id="description"
            {...register("description", {
              required: "A description is required",
            })}
          ></textarea>
          {errors.description ? (
            <FieldError>{errors.description.message}</FieldError>
          ) : null}
        </div>
        <div>
          <FormLabel error={!!errors.tags} htmlFor="tags">
            <span>Category Tags</span>
          </FormLabel>
          <Controller
            rules={{
              max: {
                message: "6 is the max amount of tags",
                value: 6,
              },
            }}
            control={control}
            name="tags"
            render={({ field, fieldState }) => (
              <div>
                <TagInput
                  classOverride={{
                    button: `inline-block rounded-r-md bg-dato-accent px-3 py-2 text-lg font-medium uppercase leading-normal text-white transition duration-150 ease-in-out hover:opacity-80 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:opacity-80 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70`,
                    input:
                      "h-full border-r-0 border-dato-border focus:border-dato-accent focus:shadow-[0_0_0_3px_var(--semi-transparent-accent-color)] text-dato-m focus:outline-0 focus:ring-0",
                  }}
                  name={field.name}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  vailidate={(tag, tags) => {
                    if (!tag.length || tag.length < 3) {
                      setError("tags", {
                        message: "The minium length for a tag is 3.",
                        type: "minLength",
                      });
                      return false;
                    }
                    if (tag.length > 12) {
                      setError("tags", {
                        message: "The maxium length for a tag is 12.",
                        type: "maxLength",
                      });
                      return false;
                    }

                    if (tags.includes(tag)) {
                      setError("tags", {
                        message: `The tag "${tag}" is already in the list.`,
                        type: "pattern",
                      });
                      return false;
                    }

                    clearErrors("tags");
                    return true;
                  }}
                />
                {fieldState.error ? (
                  <FieldError>{fieldState.error.message}</FieldError>
                ) : null}
              </div>
            )}
          />
        </div>
        <div>
          <FormLabel htmlFor="image" error={!!errors.image}>
            Image
          </FormLabel>
          <Controller
            rules={{ required: "Please select image." }}
            control={control}
            name="image"
            render={({ field }) => (
              <div
                id="image"
                className="flex flex-col justify-center gap-dato-l"
              >
                <div className="flex justify-center">
                  <Image
                    unoptimized
                    className="rounded-full"
                    src={field.value}
                    alt="Category Icon"
                    height={120}
                    width={120}
                  />
                </div>
                <div className="flex justify-center gap-dato-s">
                  <Button
                    buttonSize="xxs"
                    buttonType="primary"
                    onClick={async () => {
                      const image = await ctx.selectUpload({ multiple: false });
                      if (!image) return;
                      field.onChange(image?.attributes.url);
                    }}
                  >
                    Select Image
                  </Button>
                  <Button
                    buttonSize="xxs"
                    buttonType="primary"
                    onClick={() => field.onChange(generateImage())}
                  >
                    Use Generated
                  </Button>
                </div>
              </div>
            )}
          />
        </div>
        <Button
          type="submit"
          fullWidth
          buttonType="primary"
          className="mt-dato-l"
        >
          Submit
        </Button>
      </Form>
    </Canvas>
  );
};

export default EditThreadModel;
