import { Panel } from "./Panel";
import type { RenderPageCtx } from "datocms-plugin-sdk";
import {
  Button,
  FieldGroup,
  Form,
  Spinner,
  SwitchField,
} from "datocms-react-ui";
import { Controller, useForm } from "react-hook-form";
import { AuthFetch } from "@lib/utils/plugin/auth_fetch";

type FeatureFlag = {
  value: boolean;
  setting: {
    key: string;
    settingId: number;
    settingType: "boolean" | "string" | "int" | "double";
  };
};

type FormState = {
  community: {
    value: boolean;
    id: number;
  };
  shop: {
    value: boolean;
    id: number;
  };
};

const Features: React.FC<{
  ctx: RenderPageCtx;
  mini: boolean;
  setMini: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ ctx, mini, setMini }) => {
  //const { data, isLoading, error, mutate } = useSWR("/api/plugin/flags", (url) => AuthFetch(url).then(value => value.json() as Promise<FeatureFlag[]>));

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, isLoading },
  } = useForm<FormState>({
    async defaultValues() {
      const responcse = await AuthFetch("/api/plugin/flags");

      const flags = (await responcse.json()) as FeatureFlag[];

      return flags.reduce(
        (acc, curr) => {
          acc[curr.setting.key] = {
            value: curr.value,
            id: curr.setting.settingId,
          };
          return acc;
        },
        {} as Record<string, { value: boolean; id: number }>,
      ) as FormState;
    },
  });

  const onSubmit = async (state: FormState) => {
    try {
      await AuthFetch("/api/plugin/flags", {
        json: state,
        method: "PUT",
      });
      ctx.notice("Updated Feature Flags").catch((e) => console.error(e));
    } catch (error) {
      console.error(error);
      ctx
        .alert("Failed to update Feature Flags")
        .catch((e) => console.error(e));
    }
  };

  return (
    <Panel
      value="5"
      title="Feature Flags"
      mini={mini}
      setMini={() => setMini((state) => !state)}
    >
      {isLoading ? (
        <div className="flex h-full w-full items-center justify-center">
          <Spinner size={56} />
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
            <h1 className="text-3xl font-bold">Feature Flags</h1>
            <FieldGroup className="mb-dato-l">
              <Controller
                control={control}
                name="shop"
                render={({ field, fieldState }) => (
                  <SwitchField
                    hint="Enable or disable access to the shop page."
                    error={fieldState.error?.message}
                    id={field.name}
                    name={field.name}
                    label="Shop Page"
                    value={field.value.value}
                    onChange={(value) => {
                      field.onChange({ id: field.value.id, value });
                    }}
                  />
                )}
              />
            </FieldGroup>

            <FieldGroup className="mb-4">
              <Controller
                control={control}
                name="community"
                render={({ field, fieldState }) => (
                  <SwitchField
                    hint="Enable or disable access to the Community page."
                    error={fieldState.error?.message}
                    id={field.name}
                    name={field.name}
                    label="Community Page"
                    value={field.value.value}
                    onChange={(value) => {
                      field.onChange({ id: field.value.id, value });
                    }}
                  />
                )}
              />
            </FieldGroup>

            <Button
              type="submit"
              fullWidth
              disabled={isSubmitting}
              buttonType="primary"
              buttonSize="l"
            >
              Save
            </Button>
          </Form>
        </div>
      )}
    </Panel>
  );
};

export default Features;
