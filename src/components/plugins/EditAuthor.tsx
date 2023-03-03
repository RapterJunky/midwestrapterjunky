import type { RenderModalCtx } from "datocms-plugin-sdk";
import { useEffect, useState } from "react";
import { useForm, Controller, type Control } from "react-hook-form";
import {
  Canvas,
  Button,
  TextField,
  FieldGroup,
  FormLabel,
  Form,
  FieldError,
} from "datocms-react-ui";
import Image from "next/image";
import { FaTrash } from "react-icons/fa";

interface FormState {
  avatar: string;
  name: string;
  social: { user: string; link: string } | null;
  id: string;
}

const ImageSelect = ({
  ctx,
  form,
  name,
}: {
  name: string | undefined;
  ctx: RenderModalCtx;
  form: { control: Control<FormState, any> };
}) => {
  return (
    <Controller
      rules={{ required: "Please Select a image." }}
      control={form.control}
      name="avatar"
      render={({ fieldState, field }) => (
        <div>
          <FormLabel htmlFor="imageSelect">Image</FormLabel>
          {field.value ? (
            <div className="group relative flex items-center justify-center p-2">
              <div className="relative h-28 w-28">
                <Image
                  sizes="100vw"
                  src={field.value}
                  alt="Selected Image"
                  fill
                />
              </div>
              <button
                className="absolute hidden h-full w-full items-center justify-center bg-slate-400 bg-opacity-40 group-hover:flex"
                onClick={() => {
                  field.onChange(null);
                }}
              >
                <FaTrash className="h-8 w-8 text-red-600" />
              </button>
            </div>
          ) : (
            <section
              id="imageSelect"
              className="flex h-28 items-center justify-center gap-2 p-2"
            >
              <Button
                type="button"
                onClick={async () => {
                  const image = await ctx.selectUpload({ multiple: false });
                  if (!image) return;
                  field.onChange(image.attributes.url);
                }}
              >
                Use Existing Image
              </Button>
              <Button
                onClick={() => {
                  const random = `https://api.dicebear.com/5.x/initials/png?seed=${encodeURIComponent(
                    name ?? "Author"
                  )}`;
                  field.onChange(random);
                }}
                type="button"
                buttonType="negative"
              >
                Use Random Image
              </Button>
            </section>
          )}
          {fieldState.error?.message ? (
            <FieldError>{fieldState.error.message}</FieldError>
          ) : null}
        </div>
      )}
    />
  );
};

export default function EditAuthorModal({ ctx }: { ctx: RenderModalCtx }) {
  const [isEdit, setEdit] = useState(!!Object.keys(ctx.parameters).length)
  const [page, setPage] = useState("/");

  const { control, handleSubmit, watch } = useForm<FormState>({
    defaultValues: ctx.parameters,
  });

  const name = watch("name");

  const submit = (values: FormState) => {
    let social = values.social;
    if (!social?.link || !social?.user) {
      social = null;
    }

    ctx.resolve({
      avatar: values.avatar,
      name: values.name,
      social,
      id: values?.id ?? crypto.randomUUID().replaceAll("-", ""),
    });
  };

  if (isEdit) return (
    <Canvas ctx={ctx}>
      <Form onSubmit={handleSubmit(submit)}>
        <FieldGroup>
          <Controller
            rules={{ required: "Author's name is required." }}
            control={control}
            name="name"
            render={({ fieldState, field: { name, onChange, value } }) => (
              <TextField
                error={fieldState.error?.message}
                required
                id="author"
                name={name}
                placeholder="Enter author's full name."
                hint="Provide a full name"
                label="Author's name"
                onChange={onChange}
                value={value ?? undefined}
              />
            )}
          />
          <ImageSelect name={name} form={{ control }} ctx={ctx} />
          <Controller
            control={control}
            name="social.user"
            render={({ fieldState, field }) => (
              <TextField
                error={fieldState.error?.message}
                id="socialusername"
                name={field.name}
                placeholder="Enter social media username."
                label="Social Media Username"
                onChange={field.onChange}
                value={field.value ?? undefined}
              />
            )}
          />
          <Controller
            control={control}
            name="social.link"
            render={({ field, fieldState }) => (
              <TextField
                error={fieldState.error?.message}
                id="sociallink"
                name={field.name}
                placeholder="Enter social media link"
                label="Social Media Link"
                onChange={field.onChange}
                value={field.value ?? undefined}
              />
            )}
          />
        </FieldGroup>
        <div className="mt-5 flex justify-between">
          {ctx.parameters?.id ? (
            <Button
              onClick={() =>
                ctx.resolve({ type: "delete", id: ctx.parameters.id })
              }
              leftIcon={<FaTrash style={{ fill: "var(--lighter-bg-color)" }} />}
              buttonType="negative"
              type="submit"
            >
              Delete
            </Button>
          ) : (
            <Button onClick={() => setEdit(false)} buttonType="negative">Back</Button>
          )}
          <Button buttonType="primary" type="submit">
            Submit
          </Button>
        </div>
      </Form>
    </Canvas>
  );

  return (
    <Canvas ctx={ctx}>
      {page === "/" ? (
        <div className="flex flex-col content-around justify-around divide-x-4">
          <Button onClick={() => setEdit(true)}>Create New</Button>
          <Button onClick={() => setPage("edit")}>Use Existing</Button>
        </div>
      ) : (
        <div></div>
      )}
    </Canvas>
  );
}