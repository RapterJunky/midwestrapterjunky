import type { RenderConfigScreenCtx } from "datocms-plugin-sdk";
import { Button, Canvas, TextField, Form, FieldGroup } from "datocms-react-ui";
import { useForm, Controller } from "react-hook-form";
import { normalizeConfig, type VaildConfig } from "@utils/plugin/types";
import { FaEdit, FaTrash } from "react-icons/fa";
import { useState } from "react";

const getKeys = (storefront: VaildConfig["storefronts"][0]) => {
  const keys: string[] = [];

  if (storefront.type === "S") {
    keys.push(
      `${storefront.domain}_SHOPIFY_ACCESS_TOKEN`,
      `${storefront.domain}_SHOPIFY_DOMAIN`
    );
  }

  return keys;
};

export default function ConfigScreen({ ctx }: { ctx: RenderConfigScreenCtx }) {
  const [removelQueue, setRemovelQueue] = useState<string[]>([]);
  const { handleSubmit, control, formState } = useForm<VaildConfig>({
    defaultValues: normalizeConfig(ctx.plugin.attributes.parameters),
  });

  const onSubmit = async (state: VaildConfig) => {
    if (!ctx.currentRole.meta.final_permissions.can_edit_schema) {
      return ctx.alert(
        "User does not have the permission to perform the operation."
      );
    }
    await ctx.updatePluginParameters(state as VaildConfig);

    await new Promise<void>(async (ok) => {
      if (state.storefronts.length < 0 || !state.keyToken) return ok();
      try {
        const keys = state.storefronts
          .map((value) => {
            if (value.type === "S") {
              return [
                {
                  key: `${value.domain}_SHOPIFY_ACCESS_TOKEN`,
                  value: value.token,
                },
                { key: `${value.domain}_SHOPIFY_DOMAIN`, value: value.domain },
              ];
            }
            return [];
          })
          .flat();

        await fetch("/api/keys", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${state.keyToken}`,
          },
          body: JSON.stringify(keys),
        });

        ok();
      } catch (error) {
        console.error(error);
        ok();
      }
    });

    await new Promise<void>(async (ok) => {
      try {
        if (removelQueue.length < 1) return ok();

        await fetch("/api/keys", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${state.keyToken}`,
          },
          body: JSON.stringify(removelQueue),
        });
        setRemovelQueue([]);

        ok();
      } catch (error) {
        console.error(error);
        ok();
      }
    });

    ctx.notice("Settings updated successfully!");
  };

  return (
    <Canvas ctx={ctx}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <h1 className="text-2xl font-bold">General Settings</h1>
        <FieldGroup>
          <Controller
            control={control}
            rules={{ required: "This field is required!" }}
            name="keyToken"
            render={({ field: { ref, ...field }, formState }) => (
              <TextField
                error={formState.errors?.keyToken?.message}
                id={field.name}
                label="System Key"
                placeholder="xxxxxxxxxx"
                required
                {...field}
              />
            )}
          />
        </FieldGroup>
        <h1 className="text-2xl font-bold">Storefronts</h1>
        <Controller
          control={control}
          name="storefronts"
          render={({ field, fieldState }) => (
            <>
              <table className="w-full divide-y">
                <thead>
                  <tr>
                    <th>Storefront</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {field.value.map((value, idx) => (
                    <tr key={idx} className="divide-x">
                      <td>
                        {value.label}{" "}
                        <span className="font-sans text-gray-400">
                          ({value.domain})
                        </span>
                      </td>
                      <td className="mr-2 flex justify-end gap-2 py-2">
                        <Button
                          onClick={async () => {
                            const result = await ctx.openModal({
                              title: "Edit Storefront",
                              id: "storefrontModel",
                              parameters: value,
                            });
                            if (!result) return;
                            field.onChange([
                              ...field.value.filter(
                                (item) => item.domain !== value.domain
                              ),
                              result,
                            ]);
                          }}
                          buttonSize="xxs"
                          buttonType="primary"
                          leftIcon={<FaEdit style={{ fill: "white" }} />}
                          type="button"
                        />
                        <Button
                          onClick={async () => {
                            const result = (await ctx.openConfirm({
                              cancel: {
                                label: "Cancel",
                                intent: "positive",
                                value: false,
                              },
                              title: "Remove Storefront",
                              content: "Are you sure?",
                              choices: [
                                {
                                  intent: "negative",
                                  label: "Yes",
                                  value: true,
                                },
                              ],
                            })) as boolean;

                            if (result) {
                              setRemovelQueue((values) => {
                                const data = getKeys(value);
                                return [...values, ...data];
                              });
                              field.onChange(
                                field.value.filter(
                                  (value) => value.domain !== value.domain
                                )
                              );
                            }
                          }}
                          buttonSize="xxs"
                          buttonType="negative"
                          leftIcon={<FaTrash style={{ fill: "white" }} />}
                        ></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div>
                <Button
                  onClick={async () => {
                    const data = (await ctx.openModal({
                      id: "storefrontModel",
                      title: "Add Storefront",
                    })) as {
                      token: string;
                      type: string;
                      domain: string;
                      label: string;
                    } | null;

                    if (!data) return;

                    if (
                      field.value.some((value) => value.domain === data.domain)
                    ) {
                      ctx.alert(
                        `A storefront with domain ${data.domain} already exits.`
                      );
                      return;
                    }
                    field.onChange([...field.value, data]);
                  }}
                  buttonType="primary"
                  buttonSize="xs"
                >
                  Add Storefront
                </Button>
              </div>
            </>
          )}
        />
        <h1 className="text-2xl font-bold">Preview Settings</h1>
        <FieldGroup>
          <Controller
            control={control}
            rules={{ required: 'Site url is required' }}
            name="siteUrl"
            render={({ field: { ref, ...field }, formState }) => (
              <TextField
                error={formState.errors?.siteUrl?.message}
                id={field.name}
                label="Site URL"
                placeholder="https://google.com"
                hint="The url of your Next.js site deployment"
                required
                {...field}
              />
            )}
          />
        </FieldGroup>
        <FieldGroup>
          <Controller
            control={control}
            name="previewPath"
            rules={{ required: 'Preview path is required' }}
            render={({ field: { ref: inputRef, ...field }, fieldState }) => {
              return (
                <TextField
                  {...field}
                  required
                  placeholder="/api/preview"
                  error={fieldState.error?.message}
                  id="previewPath"
                  label="Preview API path"
                  hint="Next.js API path to link to to enable previews"
                />
              );
            }}
          />
        </FieldGroup>
        <FieldGroup>
          <Controller
            control={control}
            name="previewSecret"
            render={({ field: { ref: inputRef, ...field }, fieldState }) => {
              return (
                <TextField
                  {...field}
                  placeholder="API preview secret"
                  error={fieldState.error?.message}
                  id="previewSecret"
                  label="Preview secret"
                  hint="Secret to append to preview link query parameter, leave blank if none is needed"
                />
              );
            }}
          />
        </FieldGroup>
        <Button
          type="submit"
          fullWidth
          buttonSize="l"
          buttonType="primary"
          disabled={formState.isSubmitting}
        >
          Save settings
        </Button>
      </Form>
    </Canvas>
  );
}
