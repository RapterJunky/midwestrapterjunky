import { Canvas, TextField, Button, FormLabel, Form, FieldError } from "datocms-react-ui";
import type { RenderModalCtx } from "datocms-plugin-sdk";
import { useForm, Controller } from "react-hook-form";
import Image from "next/image";
import TagInput from "../TagInput";

interface State {
  name: string;
  description: string;
  id: number;
  tags: string[],
  image: string;
}

const generateImage = () => `https://api.dicebear.com/6.x/shapes/png?seed=${crypto.randomUUID().split("-")[0]}`;

const EditThreadModel: React.FC<{ ctx: RenderModalCtx }> = ({ ctx }) => {
  const { setError, clearErrors, control, handleSubmit, register, formState: { errors } } = useForm<State>({
    defaultValues: {
      name:
        ctx.parameters.type === "edit"
          ? (ctx.parameters as { data: State })?.data.name
          : "",
      description:
        ctx.parameters.type === "edit"
          ? (ctx.parameters as { data: State })?.data.description
          : "",
      tags: ctx.parameters.type === "edit" ? (ctx.parameters as { data: State })?.data.tags ?? [] : [],
      id:
        ctx.parameters.type === "edit"
          ? (ctx.parameters as { data: State })?.data.id
          : -1,
      image: ctx.parameters.type === "edit"
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
        <div className="mt-dato-l">
          <FormLabel required error={!!errors.description} htmlFor="description">
            <span>Category Description</span>
          </FormLabel>
          <textarea className={`w-full border placeholder:text-dato-placeholder ${errors.description ? "border-dato-alert focus:border-dato-alert focus:shadow-[0_0_0_3px_rgba(var(--alert-color-rgb-components),.2)]" : "focus:border-dato-accent border-dato-border focus:shadow-[0_0_0_3px_var(--semi-transparent-accent-color)]"} focus:outline-0 focus:ring-0 text-dato-m`} placeholder="description" id="description" {...register("description", { required: "A description is required" })}></textarea>
          {errors.description ? <FieldError>{errors.description.message}</FieldError> : null}
        </div>
        <div>
          <FormLabel error={!!errors.tags} htmlFor="tags">
            <span>Category Tags</span>
          </FormLabel>
          <Controller control={control} name="tags" render={({ field }) => (
            <TagInput className={`border ${errors.tags ? "border-dato-alert focus:border-dato-alert focus:shadow-[0_0_0_3px_rgba(var(--alert-color-rgb-components),.2)]" : "focus:border-dato-accent border-dato-border focus:shadow-[0_0_0_3px_var(--semi-transparent-accent-color)]"}`} onChange={field.onChange} value={field.value} max={6} setError={(type, message) => setError("tags", { message, type })} clearError={clearErrors} />
          )} />
          {errors.tags ? <FieldError>{errors.tags.message}</FieldError> : null}
        </div>
        <div>
          <FormLabel htmlFor="image" error={!!errors.image}>Image</FormLabel>
          <Controller rules={{ required: "Please select image." }} control={control} name="image" render={({ field }) => (
            <div id="image" className="flex flex-col gap-dato-l justify-center">
              <div className="flex justify-center">
                <Image unoptimized className="rounded-full" src={field.value} alt="Category Icon" height={120} width={120} />
              </div>
              <div className="flex gap-dato-s justify-center">
                <Button buttonSize="xxs" buttonType="primary" onClick={async () => {
                  const image = await ctx.selectUpload({ multiple: false });
                  field.onChange(image?.attributes.url);
                }}>Select Image</Button>
                <Button buttonSize="xxs" buttonType="primary" onClick={() => field.onChange(generateImage())}>Use Generated</Button>
              </div>
            </div>
          )} />
        </div>
        <Button
          type="submit"
          fullWidth
          buttonType="primary"
          className="mt-dato-l">
          Submit
        </Button>
      </Form>
    </Canvas >
  );
};

export default EditThreadModel;