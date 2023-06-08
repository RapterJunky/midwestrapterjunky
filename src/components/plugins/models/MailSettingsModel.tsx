import {
  Button,
  Canvas,
  FieldError,
  FormLabel,
  TextField,
  FieldGroup,
  FieldHint,
  SwitchField,
  Form,
  SelectField,
  Spinner,
  ButtonLink,
} from "datocms-react-ui";
import { useForm, Controller } from "react-hook-form";
import type { RenderModalCtx } from "datocms-plugin-sdk";
import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";

import { AuthFetch } from "@lib/utils/plugin/auth_fetch";
import TagInput from "@components/TagInput";

type MailSettingsForm = {
  name: string;
  categories: string[];
  send_at: string | null;
  send_to: {
    list_ids: { label: string; value: string }[];
    segment_ids: { label: string; value: string }[];
    all: boolean;
  };
};

type MailConfigForm = {
  design_id: { label: string; value: string };
  sender_id: { label: string; value: number };
  editor: "design" | "code";
  suppression_group_id: { label: string; value: number };
};

type SendGridData = {
  senders: { label: string; value: number }[];
  lists: { label: string; value: string }[];
  segments: { label: string; value: string }[];
  designs: { label: string; value: string }[];
};

type PageState = {
  settings: MailSettingsForm | null;
  config: MailConfigForm | null;
  data: {
    link: string;
    id: string;
  } | null;
};

const MailSettings: React.FC<{
  pageState: PageState;
  data: SendGridData | undefined;
  onNext: (data: PageState["settings"]) => void;
}> = ({ pageState, onNext, data }) => {
  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
    setError,
    watch,
  } = useForm<MailSettingsForm>({
    defaultValues: {
      name: pageState.settings?.name ?? "",
      categories: pageState.settings?.categories ?? [],
      send_at: pageState.settings?.send_at ?? null,
      send_to: {
        list_ids: pageState.settings?.send_to.list_ids ?? [],
        segment_ids: pageState.settings?.send_to.segment_ids ?? [],
        all: pageState.settings?.send_to.all ?? true,
      },
    },
  });

  const contactAll = watch("send_to.all");
  const segments = watch("send_to.segment_ids");
  const lists = watch("send_to.list_ids");

  return (
    <Form onSubmit={handleSubmit(onNext)}>
      <h1 className="text-dato-m font-bold">General Mail Settings</h1>

      <Controller
        rules={{
          required: "A name is required.",
          maxLength: {
            value: 100,
            message: "The name is too long.",
          },
          minLength: {
            value: 1,
            message: "The name is too short.",
          },
        }}
        control={control}
        name="name"
        render={({ field, fieldState }) => (
          <div className="mb-dato-m">
            <TextField
              required
              value={field.value}
              onChange={field.onChange}
              label="Name"
              error={fieldState.error?.message}
              id="name"
              name={field.name}
              hint="The name of the Single Send."
            />
          </div>
        )}
      />

      <Controller
        rules={{
          max: {
            message: "There can only be 10 categories.",
            value: 10,
          },
        }}
        control={control}
        name="categories"
        render={({ field, fieldState }) => (
          <div className="mb-dato-m">
            <FormLabel error={!!fieldState.error} htmlFor="tags">
              <span>Categories</span>
            </FormLabel>
            <TagInput
              classOverride={{
                button: `inline-block rounded-r-md bg-dato-accent px-3 py-2 text-lg font-medium uppercase leading-normal text-white transition duration-150 ease-in-out hover:opacity-80 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:opacity-80 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70`,
                input:
                  "h-full border-r-0 border-dato-border focus:border-dato-accent focus:shadow-[0_0_0_3px_var(--semi-transparent-accent-color)] text-dato-m focus:outline-0 focus:ring-0",
              }}
              id="tags"
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              vailidate={(tag, tags) => {
                if (!tag.length || tag.length < 3) {
                  setError("categories", {
                    message: "The minium length for a tag is 3.",
                    type: "minLength",
                  });
                  return false;
                }

                if (tags.includes(tag)) {
                  setError("categories", {
                    message: `The tag "${tag}" is already in the list.`,
                    type: "pattern",
                  });
                  return false;
                }
                return true;
              }}
            />
            {fieldState.error ? (
              <FieldError>{fieldState.error.message}</FieldError>
            ) : null}
          </div>
        )}
      />

      <div>
        <FormLabel error={!!errors.send_at} htmlFor="send_at">
          <span>Send At</span>
        </FormLabel>
        <input id="send_at" {...register("send_at", {})} type="date" />
        {errors.send_at ? (
          <FieldError>{errors.send_at.message}</FieldError>
        ) : null}
        <FieldHint>
          If you want to schedule a time to send this. Enter a value in this box
          above else leave empty.
        </FieldHint>
      </div>

      <FieldGroup>
        <Controller
          control={control}
          name="send_to.all"
          render={({ field, fieldState }) => (
            <SwitchField
              name={field.name}
              value={field.value}
              onChange={field.onChange}
              hint=""
              label="Send to all Contacts"
              id={field.name}
              error={fieldState.error?.message}
            />
          )}
        />
        {!contactAll ? (
          <>
            <Controller
              rules={{
                maxLength: {
                  value: 50,
                  message: "There can only be a max of 50 recipients.",
                },
                required: {
                  message:
                    "A value must be selected or a Segment value must be selected.",
                  value: !segments.length,
                },
              }}
              control={control}
              name="send_to.list_ids"
              render={({ field, fieldState }) => (
                <SelectField
                  error={fieldState.error?.message}
                  label="Recipients"
                  value={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  id="list_ids"
                  hint={
                    <span>
                      Recipients to send this email to.{" "}
                      <Link
                        className="text-blue-500 underline"
                        href="https://mc.sendgrid.com/contacts"
                        target="_blank"
                      >
                        Click here to edit or create contacts.
                      </Link>
                    </span>
                  }
                  selectInputProps={{
                    isMulti: true,
                    options: data?.lists ?? [],
                  }}
                />
              )}
            />
            <Controller
              rules={{
                maxLength: {
                  value: 10,
                  message: "There can only be a max of 10 recipient groups.",
                },
                required: {
                  message:
                    "A value must be selected or a List value must be selected.",
                  value: !lists.length,
                },
              }}
              control={control}
              name="send_to.segment_ids"
              render={({ field, fieldState }) => (
                <SelectField
                  error={fieldState.error?.message}
                  label="Recipient Groups"
                  value={field.value}
                  onChange={field.onChange}
                  name={field.name}
                  id="segment_ids"
                  hint={
                    <span>
                      Recipient groups to send this email to.{" "}
                      <Link
                        className="text-blue-500 underline"
                        href="https://mc.sendgrid.com/contacts"
                        target="_blank"
                      >
                        Click here to edit or create groups.
                      </Link>
                    </span>
                  }
                  selectInputProps={{
                    isMulti: true,
                    options: data?.segments ?? [],
                  }}
                />
              )}
            />
          </>
        ) : null}
      </FieldGroup>

      <div className="flex w-full justify-end">
        <Button buttonType="primary" type="submit">
          Next
        </Button>
      </div>
    </Form>
  );
};

const MailConfig: React.FC<{
  ctx: RenderModalCtx;
  pageState: PageState;
  data: SendGridData | undefined;
  onNext: (
    data: PageState["config"],
    draft: { id: string; link: string }
  ) => void;
  onBack: () => void;
}> = ({ ctx, pageState, onNext, onBack, data }) => {
  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<MailConfigForm>({
    defaultValues: {
      design_id: pageState.config?.design_id,
      sender_id: pageState.config?.sender_id,
      editor: pageState.config?.editor ?? "design",
      suppression_group_id: pageState.config?.suppression_group_id ?? {
        label: "Global Unsubscribe",
        value: -1,
      },
    },
  });

  const onSubmit = async (state: MailConfigForm) => {
    if (!pageState.settings) return;

    try {
      const data = await AuthFetch("/api/plugin/mail?type=draft", {
        method: "POST",
        json: {
          name: pageState.settings.name,
          categories: pageState.settings.categories,
          send_at: pageState.settings.send_at,
          send_to: {
            list_ids: pageState.settings.send_to.list_ids.map(
              (value) => value.value
            ),
            segment_ids: pageState.settings.send_to.segment_ids.map(
              (value) => value.value
            ),
            all: pageState.settings.send_to.all,
          },
          email_config: {
            design_id: state.design_id.value,
            editor: state.editor,
            suppression_group_id: state.suppression_group_id.value,
            sender_id: state.sender_id.value,
          },
        },
      });

      const body = (await data.json()) as { id: string; link: string };

      onNext(state, body);
    } catch (error) {
      ctx.alert("Failed to create draft").catch((e) => console.error(e));
    }
  };
  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        rules={{ required: "A design is required." }}
        control={control}
        name="design_id"
        render={({ field, fieldState }) => (
          <SelectField
            label="Design"
            hint={
              <Link
                className="text-blue-500 underline"
                href="https://mc.sendgrid.com/design-library/your-designs"
              >
                Click here to create a desigin
              </Link>
            }
            error={fieldState.error?.message}
            name={field.name}
            id={field.name}
            value={field.value}
            onChange={field.onChange}
            selectInputProps={{
              isMulti: false,
              options: data?.designs ?? [],
            }}
          />
        )}
      />
      <Controller
        rules={{ required: "A Sender is required." }}
        control={control}
        name="sender_id"
        render={({ field, fieldState }) => (
          <SelectField
            label="Sender"
            error={fieldState.error?.message}
            name={field.name}
            id={field.name}
            value={field.value}
            onChange={field.onChange}
            selectInputProps={{
              isMulti: false,
              options: data?.senders ?? [],
            }}
          />
        )}
      />
      <Controller
        rules={{ required: "Unsubscribe link is required." }}
        control={control}
        name="suppression_group_id"
        render={({ field, fieldState }) => (
          <SelectField
            label="Unsubscribe Link"
            error={fieldState.error?.message}
            name={field.name}
            id={field.name}
            value={field.value}
            onChange={field.onChange}
            selectInputProps={{
              isMulti: false,
              options: [{ label: "Global Unsubscribe", value: -1 }],
            }}
          />
        )}
      />

      <div className="flex w-full justify-between">
        <Button onClick={onBack} type="button" buttonType="primary">
          Back
        </Button>
        <Button
          type="submit"
          buttonType="primary"
          disabled={isSubmitting}
          leftIcon={isSubmitting ? <Spinner size={24} /> : null}
        >
          Next
        </Button>
      </div>
    </Form>
  );
};

const MailCommit: React.FC<{ pageState: PageState; ctx: RenderModalCtx }> = ({
  pageState,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <p>To finish click the link bellow</p>
      <ButtonLink target="_blank" href={pageState.data?.link ?? ""}>
        Edit
      </ButtonLink>
    </div>
  );
};

const MailSettingsModel: React.FC<{ ctx: RenderModalCtx }> = ({ ctx }) => {
  const [pageState, setPageState] = useState<PageState>({
    config: null,
    settings: null,
    data: null,
  });
  const { data } = useSWR<SendGridData, Error, string>(
    "/api/plugin/mail?type=contacts",
    (url) =>
      AuthFetch(url).then((value) => value.json() as Promise<SendGridData>)
  );
  const [page, setPage] = useState(0);
  return (
    <Canvas ctx={ctx}>
      {page === 0 ? (
        <MailSettings
          pageState={pageState}
          data={data}
          onNext={(data) => {
            setPageState((state) => {
              return {
                ...state,
                settings: data,
              };
            });
            setPage(1);
          }}
        />
      ) : page === 1 ? (
        <MailConfig
          ctx={ctx}
          pageState={pageState}
          data={data}
          onBack={() => setPage(0)}
          onNext={(data, body) => {
            setPageState((state) => {
              return {
                ...state,
                config: data,
                data: body,
              };
            });
            setPage(2);
          }}
        />
      ) : (
        <MailCommit ctx={ctx} pageState={pageState} />
      )}
    </Canvas>
  );
};

export default MailSettingsModel;
