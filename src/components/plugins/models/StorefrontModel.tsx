import type { RenderModalCtx } from "datocms-plugin-sdk";
import {
  Button,
  Canvas,
  FieldGroup,
  Form,
  SelectField,
  SwitchField,
  TextField,
} from "datocms-react-ui";
import { Controller, useForm } from "react-hook-form";
import ShopifyClient from "@lib/plugin/ShopifyClient";
import SquareClient from "@lib/plugin/SquareClient";
import type { StorefrontPluginConfig } from "@lib/utils/plugin/config";

const options = [
  { label: "Shopify", value: "S" },
  { label: "Sqaure", value: "SQ" },
] as const;

export default function StorefrontModel({ ctx }: { ctx: RenderModalCtx }) {
  const { control, handleSubmit, formState, setError } =
    useForm<StorefrontPluginConfig>({
      defaultValues: Object.keys(ctx.parameters).length
        ? ctx.parameters
        : { type: "S", domain: "", token: "", label: "", test: false },
    });

  const submit = async (params: StorefrontPluginConfig) => {
    if (!ctx.currentRole.meta.final_permissions.can_edit_schema) {
      return ctx.alert(
        "User does not have the permission to perform the operation.",
      );
    }

    switch (params.type) {
      case "S": {
        try {
          const client = new ShopifyClient({
            shopifyDomain: params.domain,
            storefrontAccessToken: params.token,
          });
          await client.productsMatching("foo");
        } catch (error) {
          setError("token", {
            message:
              "The API key seems to be invalid for the specified Shopify domain!",
            type: "validate",
          });
          return;
        }
        break;
      }
      case "SQ": {
        try {
          const client = new SquareClient(
            params.domain,
            params.token,
            params.test,
          );
          await client.productsMatching("foo");
        } catch (error) {
          setError("token", {
            message:
              (error as Error)?.message ??
              "The API Key seems to be invaild for the specified square domain!",
            type: "validate",
          });
        }
        break;
      }
      default:
        break;
    }

    await ctx.resolve(params);
  };

  return (
    <Canvas ctx={ctx}>
      <Form onSubmit={handleSubmit(submit)}>
        <FieldGroup>
          <Controller
            rules={{ required: "This field is required!" }}
            control={control}
            name="type"
            render={({ formState, field }) => (
              <SelectField
                selectInputProps={{
                  isMulti: false,
                  options,
                  defaultValue: options[0],
                }}
                onChange={(value) => {
                  if (!value) return;
                  field.onChange(value.value);
                }}
                value={
                  options.find((value) => value.value === field.value) ??
                  options[0]
                }
                label="Storefront Type"
                id="storefront-type"
                name={field.name}
                error={formState.errors?.type?.message}
              />
            )}
          />
          <Controller
            control={control}
            rules={{ required: "This field is required!" }}
            name="label"
            render={({ field: { onChange, value, name }, formState }) => (
              <TextField
                error={formState.errors?.label?.message}
                hint="A easy name to identify the storefront."
                id={name}
                name={name}
                value={value}
                onChange={onChange}
                label="Storefront Label"
                placeholder="Example Storefront"
                required
              />
            )}
          />
        </FieldGroup>
        <FieldGroup>
          <Controller
            control={control}
            rules={{ required: "This field is required!" }}
            name="domain"
            render={({ field: { ref: _, ...field }, formState }) => (
              <TextField
                error={formState.errors?.domain?.message}
                hint={
                  <>
                    If your shop is <code>foo-bar.myshopify.com</code>, then
                    insert <code>foo-bar</code>
                  </>
                }
                id={field.name}
                label="Shop ID"
                placeholder="my-shop"
                required
                {...field}
              />
            )}
          />
          <Controller
            control={control}
            rules={{ required: "This field is required!" }}
            name="token"
            render={({ field: { ref: _, ...field }, formState }) => (
              <TextField
                id={field.name}
                label="Storefront access token"
                {...field}
                hint={
                  <>
                    You can get a Storefront access token by creating a private
                    app. Take a look at{" "}
                    <a
                      className="underline"
                      href="https://help.shopify.com/en/api/custom-storefronts/storefront-api/getting-started#authentication"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Shopify documentation
                    </a>{" "}
                    for more info
                  </>
                }
                textInputProps={{ monospaced: true }}
                placeholder="XXXYYY"
                required
                error={formState.errors?.token?.message}
              />
            )}
          />
        </FieldGroup>
        <FieldGroup>
          <Controller
            control={control}
            name="test"
            render={({ field: { ref: _, ...field } }) => (
              <SwitchField
                {...field}
                id="testMode"
                label="Test mode active?"
                hint="Enables dev mode on storefront"
              />
            )}
          />
        </FieldGroup>
        <Button
          type="submit"
          fullWidth
          buttonSize="l"
          buttonType="primary"
          disabled={formState.isSubmitting || !formState.isValid}
        >
          {ctx.parameters?.label ? "Update Storefront" : "Add Storefront"}
        </Button>
      </Form>
    </Canvas>
  );
}
