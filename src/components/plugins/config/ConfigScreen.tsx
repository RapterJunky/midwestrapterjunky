import type { RenderConfigScreenCtx } from "datocms-plugin-sdk";
import { Button, Canvas, FieldGroup, Form, TextField } from "datocms-react-ui";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FaEdit, FaTrash } from "react-icons/fa";
import { AuthFetch } from "@/lib/utils/plugin/auth_fetch";
import {
  normalizeConfig,
  type StorefrontPluginConfig,
  type VaildConfig,
} from "@/lib/utils/plugin/config";

const getKeys = (storefront: VaildConfig["storefronts"][0]) => {
  const keys: string[] = [];

  if (storefront.type === "S") {
    keys.push(
      `${storefront.domain}_SHOPIFY_ACCESS_TOKEN`,
      `${storefront.domain}_SHOPIFY_DOMAIN`,
    );
  }

  return keys;
};

const ConfigScreen: React.FC<{ ctx: RenderConfigScreenCtx }> = ({ ctx }) => {
  const [removelQueue, setRemovelQueue] = useState<string[]>([]);
  const { handleSubmit, control, formState } = useForm<VaildConfig>({
    defaultValues: normalizeConfig(ctx.plugin.attributes.parameters),
  });

  const onSubmit = async (state: VaildConfig) => {
    try {
      if (!ctx.currentRole.meta.final_permissions.can_edit_schema) {
        return ctx.alert(
          "User does not have the permission to perform the operation.",
        );
      }
      await ctx.updatePluginParameters(state);

      await new Promise<void>(async (ok, reject) => {
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
                  {
                    key: `${value.domain}_SHOPIFY_DOMAIN`,
                    value: value.domain,
                  },
                ];
              }
              if (value.type === "SQ") {
                return [
                  {
                    key: `${value.domain}_SQAURE_ACCESS_TOKEN`,
                    value: value.token,
                  },
                  {
                    key: `${value.domain}_SQAURE_MODE`,
                    value: value.test
                      ? "connect.squareupsandbox.com"
                      : "connect.squareup.com",
                  },
                ];
              }
              return [];
            })
            .flat();

          await AuthFetch("/api/keys", {
            method: "PATCH",
            json: keys,
            key: state.keyToken,
          });

          ok();
        } catch (error) {
          console.error(error);
          reject();
        }
      });

      await new Promise<void>(async (ok, reject) => {
        try {
          if (removelQueue.length < 1) return ok();

          const params = new URLSearchParams();

          removelQueue.forEach((key) => params.append("keys", key));

          await AuthFetch(`/api/keys?${params.toString()}`, {
            method: "DELETE",
            key: state.keyToken,
          });

          setRemovelQueue([]);
          ok();
        } catch (error) {
          console.error(error);
          reject();
        }
      });

      ctx
        .notice("Settings updated successfully!")
        .catch((e) => console.error(e));
    } catch (error) {
      console.error(error);
      ctx.alert("Failed to update settings.").catch((e) => console.error(e));
    }
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
            render={({ field: { ref: _ref, ...field }, formState }) => (
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
        <FieldGroup>
          <Controller
            control={control}
            rules={{ required: "This field is required!" }}
            name="revalidateToken"
            render={({ field: { ref: _ref, ...field }, formState }) => (
              <TextField
                error={formState.errors.revalidateToken?.message}
                id={field.name}
                label="Revaildation token"
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
          render={({ field }) => (
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
                            const result = (await ctx.openModal({
                              title: "Edit Storefront",
                              id: "storefrontModel",
                              parameters: value,
                            })) as StorefrontPluginConfig | undefined;
                            if (!result) return;
                            field.onChange([
                              ...field.value.filter(
                                (item) => item.domain !== value.domain,
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
                                  (value) => value.domain !== value.domain,
                                ),
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
                    })) as StorefrontPluginConfig | null;

                    if (!data) return;

                    if (
                      field.value.some((value) => value.domain === data.domain)
                    ) {
                      ctx
                        .alert(
                          `A storefront with domain ${data.domain} already exits.`,
                        )
                        .catch((e) => console.error(e));
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
            rules={{ required: "Site url is required" }}
            name="siteUrl"
            render={({ field: { ref: _ref, ...field }, formState }) => (
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
            rules={{ required: "Preview path is required" }}
            render={({ field: { ref: _ref, ...field }, fieldState }) => {
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
            render={({ field: { ref: _ref, ...field }, fieldState }) => {
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
};

export default ConfigScreen;
