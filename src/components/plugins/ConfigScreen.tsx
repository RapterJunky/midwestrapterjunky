import type { RenderConfigScreenCtx } from "datocms-plugin-sdk";
import { Button, Canvas, TextField, Form, FieldGroup, SelectField } from 'datocms-react-ui';
import { useForm, Controller } from 'react-hook-form';
import ShopifyClient from "@utils/plugin/ShopifyClient";
import { normalizeConfig, type VaildConfig } from '@utils/plugin/types';

const options = [
    { label: "Shopify", value: "shopify" },
    { label: "Freewebstore", value: "freewebstore" },
    { label: "Both", value: "null" }
];

export default function ConfigScreen({ ctx }: { ctx: RenderConfigScreenCtx }){
    const { handleSubmit, control, formState, setError } = useForm<VaildConfig>({
        defaultValues: normalizeConfig(ctx.plugin.attributes.parameters)
    });

    const onSubmit = async (state: VaildConfig) => {
        // key test
        try {
            const client = new ShopifyClient(state);
            await client.productsMatching("foo");
        } catch (error) {

            setError("storefrontAccessToken", {
                message: 'The API key seems to be invalid for the specified Shopify domain!',
                type: "validate"
            });

            return;
        }

        await ctx.updatePluginParameters(state);
        try {
            if(state.keyToken.length > 0) {
                const body = [];
                if(state.freeStoreApiKey.length > 0) body.push({ key: "FREEWEBSTORE_API_TOKEN", value: state.freeStoreApiKey });
                if(state.shopifyDomain.length > 0) body.push({ key: "SHOPIFY_DOMAIN", value: state.shopifyDomain });
                if(state.storefrontAccessToken.length > 0) body.push({ key: "SHOPIFY_STOREFRONT_ACCESS_TOKEN", value: state.storefrontAccessToken });

                await fetch("/api/keys",{ 
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${state.keyToken}`
                    },
                    body: JSON.stringify(body)
                })
            }   
        } catch (error) {
            console.error(error);
        }
        ctx.notice("Settings updated successfully!");
    }

    return (
        <Canvas ctx={ctx}>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <h1 className="font-bold text-2xl">General Settings</h1>
                <FieldGroup>
                    <Controller control={control} name="useOnlyStore" render={({ field: { ref, value, onChange, ...field }, formState })=>(
                        <SelectField 
                        onChange={ev=>{ 
                            if(ev?.value === "null") return onChange(ev?.value ?? null);
                            onChange(ev?.value ?? null) 
                        }}
                        id={field.name} 
                        {...field} 
                        error={formState.errors.useOnlyStore?.message}
                        value={options.find(option=>option.value===value) ?? options[2]}
                        selectInputProps={{
                            isMulti: false,
                            options: options
                        }}
                        label="Use store front" 
                        hint="Allow for the use of both shopify and freewebstore or only one." />
                    )}/>
                     <Controller control={control} rules={{ required: "This field is required!" }} name="keyToken" render={({ field: { ref, ...field }, formState })=>(
                        <TextField error={formState.errors?.keyToken?.message} id={field.name} label="System Key" placeholder="xxxxxxxxxx" required {...field}/>
                    )} />
                </FieldGroup>
                <h1 className="font-bold text-2xl">Shopify Settings</h1>
                <FieldGroup>
                    <Controller control={control} rules={{ required: "This field is required!" }} name="shopifyDomain" render={({ field: { ref, ...field }, formState })=>(
                        <TextField error={formState.errors?.shopifyDomain?.message} hint={
                            <>
                              If your shop is <code>foo-bar.myshopify.com</code>, then
                              insert <code>foo-bar</code>
                            </>
                          } id={field.name} label="Shop ID" placeholder="my-shop" required {...field}/>
                    )} />
                    <Controller control={control} rules={{ required: "This field is required!" }} name="storefrontAccessToken" render={({ field: { ref, ...field }, formState })=>(
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
                          }textInputProps={{ monospaced: true }} placeholder="XXXYYY" required error={formState.errors?.storefrontAccessToken?.message} />
                    )}/>
                </FieldGroup>
                <h1 className="font-bold text-2xl">Freewebstore settings</h1>
                <FieldGroup>
                    <Controller control={control} rules={{ required: "This field is required!" }} name="freestoreDomain" render={({ field: { ref, ...field }, formState })=>(
                            <TextField error={formState.errors?.freestoreDomain?.message} hint={
                                <>
                                If your shop is <code>mystore.my-online.store</code>, then
                                insert <code>foo-bar</code>
                                </>
                            } id={field.name} label="Shop ID" placeholder="mystore.my-online.store" required {...field}/>
                        )} />
                    <Controller control={control} name="freeStoreApiKey" render={({ field: { ref, ...field }, formState })=>(
                            <TextField id={field.name} {...field} 
                            label="Freewebstore API token" 
                            hint={
                                <>
                                You can get a Api token from the freewebstore site. Take a look at{' '}
                                <a className="underline"
                                    href="https://freewebstore.com/"
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    Freewebstore documentation
                                </a>{' '}
                                for more info
                                </>
                            } 
                            textInputProps={{ monospaced: true }} 
                            placeholder="XXXYYY" 
                            error={formState.errors?.freeStoreApiKey?.message}/>
                        )}/>
                </FieldGroup>
                <Button type="submit" fullWidth buttonSize="l" buttonType="primary" disabled={formState.isSubmitting || !formState.isDirty}>
                    Save settings
                </Button>
            </Form>
        </Canvas>
    );
}