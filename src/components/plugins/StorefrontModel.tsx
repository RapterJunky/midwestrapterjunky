import type { RenderModalCtx } from "datocms-plugin-sdk";
import { Canvas, Form, FieldGroup, TextField, SelectField, Button } from "datocms-react-ui";
import { useForm, Controller } from 'react-hook-form';
import ShopifyClient from "@utils/plugin/ShopifyClient";

const options = [
    { label: "Shopify", value: "S" }
] as const;

interface FormState {
    type: string;
    domain: string;
    token: string;
    label: string;
}

export default function StorefrontModel({ ctx }: { ctx: RenderModalCtx }) {
    const { control, handleSubmit, formState, setError } = useForm<FormState>({
        defaultValues: ctx.parameters ?? {}
    }); 

    const submit = async (params: FormState) => {
        if(!ctx.currentRole.meta.final_permissions.can_edit_schema){
            return ctx.alert("User does not have the permission to perform the operation.");
        }

        switch (params.type) {
            case "S": {
                try {
                    const client = new ShopifyClient({
                        shopifyDomain: params.domain,
                        storefrontAccessToken: params.token
                    });
                    await client.productsMatching("foo");
                } catch (error) {
                    setError("token", {
                        message: 'The API key seems to be invalid for the specified Shopify domain!',
                        type: "validate"
                    });
                    return;
                }
                break;
            }
            default:
                break;
        }


        ctx.resolve(params);

    }

    return (
        <Canvas ctx={ctx}>
            <Form onSubmit={handleSubmit(submit)}>
                <FieldGroup>
                    <Controller rules={{ required: "This field is required!" }} control={control} name="type" render={({ formState, field })=>(
                        <SelectField selectInputProps={{ isMulti: false, options, defaultValue: options[0] }} onChange={(value)=>field.onChange(value?.value)} value={options.find(value=>value===field.value as any) ?? options[0]} label="Storefront Type" id="storefront-type" name={field.name} error={formState.errors?.type?.message}/>
                    )} />
                    <Controller control={control} rules={{ required: "This field is required!" }} name="label" render={({ field: { ref, ...field }, formState })=>(
                        <TextField error={formState.errors?.label?.message} hint="A easy name to identify the storefront." id={field.name} label="Storefront Label" placeholder="Example Storefront" required {...field}/>
                    )} />
                </FieldGroup>
                <FieldGroup>
                    <Controller control={control} rules={{ required: "This field is required!" }} name="domain" render={({ field: { ref, ...field }, formState })=>(
                            <TextField error={formState.errors?.domain?.message} hint={
                                <>
                                If your shop is <code>foo-bar.myshopify.com</code>, then
                                insert <code>foo-bar</code>
                                </>
                            } id={field.name} label="Shop ID" placeholder="my-shop" required {...field}/>
                    )} />
                    <Controller control={control} rules={{ required: "This field is required!" }} name="token" render={({ field: { ref, ...field }, formState })=>(
                            <TextField id={field.name} label="Storefront access token" {...field} hint={
                                <>
                                You can get a Storefront access token by creating a
                                private app. Take a look at{' '}
                                <a
                                    className="underline"
                                    href="https://help.shopify.com/en/api/custom-storefronts/storefront-api/getting-started#authentication"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Shopify documentation
                                </a>{' '}
                                for more info
                                </>
                            } textInputProps={{ monospaced: true }} placeholder="XXXYYY" required error={formState.errors?.token?.message} />
                    )}/>
                </FieldGroup>
                <Button type="submit" fullWidth buttonSize="l" buttonType="primary" disabled={formState.isSubmitting}>
                    {ctx.parameters?.label ? "Update Storefront" :"Add Storefront"}
                </Button>
            </Form>
        </Canvas>
    );
} 