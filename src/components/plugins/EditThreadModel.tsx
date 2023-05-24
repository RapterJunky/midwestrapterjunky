import {
  Canvas,
  TextField,
  Button,
  FormLabel,
  SwitchField,
  Form,
  FieldError,
} from "datocms-react-ui";
import { WithContext as ReactTags } from "react-tag-input";
import type { RenderModalCtx } from "datocms-plugin-sdk";
import { useForm, Controller } from "react-hook-form";
import Image from "next/image";

interface State {
  name: string;
  description: string;
  allowUserPosts: boolean;
  id: number;
  tags: string[];
  image: string;
}

const generateImage = () =>
  `https://api.dicebear.com/6.x/shapes/png?seed=${crypto.randomUUID().split("-")[0]
  }`;

const EditThreadModel: React.FC<{ ctx: RenderModalCtx }> = ({ ctx }) => {
  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<State>({
    defaultValues: {
      name:
        ctx.parameters.type === "edit"
          ? (ctx.parameters as { data: State })?.data.name
          : "",
      allowUserPosts: ctx.parameters.type === "edit"
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
        <Controller control={control} name="allowUserPosts" render={({ field, fieldState }) => (
          <SwitchField
            id={field.name}
            name={field.name}
            value={field.value}
            onChange={field.onChange}
            label="Users allowed to post."
            hint="Are users allowed to create a post in this category." error={fieldState.error?.message} />
        )} />
        <div className="mt-dato-l">
          <FormLabel
            required
            error={!!errors.description}
            htmlFor="description"
          >
            <span>Category Description</span>
          </FormLabel>
          <textarea
            className={`w-full border placeholder:text-dato-placeholder ${errors.description
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
                <ReactTags
                  inline
                  classNames={{
                    selected: "flex flex-wrap gap-1",
                    tags: "flex",
                    tagInputField: "h-full",
                    tag: "font-bold py-2 px-2.5 flex gap-2 border border-neutral-500 items-center justify-center",
                    remove:
                      "text-red-500 text-lg font-bold flex items-center text-center justify-center",
                  }}
                  allowUnique
                  autofocus
                  maxLength={12}
                  inputFieldPosition="inline"
                  handleInputBlur={field.onBlur}
                  tags={field.value.map((tag, i) => ({
                    id: i.toString(),
                    text: tag,
                  }))}
                  handleDelete={(idx) => {
                    const tags = field.value
                      .map((tag, i) => ({ id: i.toString(), text: tag }))
                      .map((value) => value.text)
                      .filter((_tag, i) => i !== idx);
                    field.onChange(tags);
                  }}
                  handleAddition={(tag: { id: string; text: string }) => {
                    field.onChange([...field.value, tag.text]);
                  }}
                  handleDrag={(
                    tag: { id: string; text: string },
                    curr: number,
                    next: number
                  ) => {
                    const tags = field.value.map((tag, i) => ({
                      id: i.toString(),
                      text: tag,
                    }));

                    tags.splice(curr, 1);
                    tags.splice(next, 0, tag);
                    field.onChange(tags.map((value) => value.text));
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
