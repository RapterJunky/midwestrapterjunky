import type { RenderConfigScreenCtx } from "datocms-plugin-sdk";
import { Button, Canvas, TextField, Form, FieldGroup } from 'datocms-react-ui';
import { useForm, Controller } from 'react-hook-form';
import { normalizeConfig, type VaildConfig } from '@utils/plugin/types';
import { FaEdit, FaTrash } from "react-icons/fa";

export default function ConfigScreen({ ctx }: { ctx: RenderConfigScreenCtx }){
    const { handleSubmit, control, formState } = useForm<VaildConfig>({
        defaultValues: normalizeConfig(ctx.plugin.attributes.parameters) 
    });

    const onSubmit = async (state: VaildConfig) => {
        if(!ctx.currentRole.meta.final_permissions.can_edit_schema){
            return ctx.alert("User does not have the permission to perform the operation.");
        }
        await ctx.updatePluginParameters(state as VaildConfig);

        await new Promise<void>(async (ok)=>{
            if(state.storefronts.length < 0 || !state.keyToken) return ok();
            try {

                const keys = state.storefronts.map(value=>{
                    if(value.type === "S") {
                        return [
                            { key: `${value.domain}_SHOPIFY_ACCESS_TOKEN`, value: value.token },
                            { key: `${value.domain}_SHOPIFY_DOMAIN`, value: value.domain }
                        ];
                    }
                    return [];
                }).flat();

                await fetch("/api/keys",{ 
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${state.keyToken}`
                    },
                    body: JSON.stringify(keys)
                });

                ok();
                
            } catch (error) {
                console.error(error);
                ok();
            }
        });

        ctx.notice("Settings updated successfully!");
    }

    return (
        <Canvas ctx={ctx}>
            <Form onSubmit={handleSubmit(onSubmit)}>
                <h1 className="font-bold text-2xl">General Settings</h1>
                <FieldGroup>
                     <Controller control={control} rules={{ required: "This field is required!" }} name="keyToken" render={({ field: { ref, ...field }, formState })=>(
                        <TextField error={formState.errors?.keyToken?.message} id={field.name} label="System Key" placeholder="xxxxxxxxxx" required {...field}/>
                    )} />
                </FieldGroup>
                <h1 className="font-bold text-2xl">Storefronts</h1>
                <Controller control={control} name="storefronts" render={({ field, fieldState })=>(
                    <><table className="w-full divide-y">
                        <thead >
                            <tr>
                                <th>Storefront</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {field.value.map((value,idx)=>(
                                <tr key={idx} className="divide-x">
                                    <td>{value.label} <span className="text-gray-400 font-sans">({value.domain})</span></td>
                                    <td className="flex justify-end py-2 mr-2 gap-2">
                                        <Button onClick={async ()=>{  
                                            const result = await ctx.openModal({
                                                title: "Edit Storefront",
                                                id: "storefrontModel",
                                                parameters: value
                                            });
                                            if(!result) return;
                                            field.onChange([...field.value.filter(item=>item.domain!==value.domain), result]);

                                        }} buttonSize="xxs" buttonType="primary" leftIcon={<FaEdit style={{ fill: "white" }}/>} type="button"/>
                                        <Button onClick={async ()=>{ 
                                            const result = await ctx.openConfirm({ 
                                                cancel: { label: "Cancel", intent: "positive", value: false },
                                                title: "Remove Storefront", 
                                                content: "Are you sure?", 
                                                choices: [{ intent: "negative", label: "Yes", value: true }] 
                                            }) as boolean;

                                            if(result) {
                                                field.onChange(field.value.filter(value=>value.domain!==value.domain));
                                            }
                                        }} buttonSize="xxs" buttonType="negative" leftIcon={<FaTrash style={{ fill: "white" }}/>}></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div>
                        <Button onClick={async ()=>{
                            const data = await ctx.openModal({
                                id: "storefrontModel",
                                title: "Add Storefront"
                            }) as { token: string; type: string; domain: string; label: string; } | null;

                            if(!data) return;
                    
                            if(field.value.some(value=>value.domain === data.domain)) {
                                ctx.alert(`A storefront with domain ${data.domain} already exits.`);
                                return;
                            }   
                            field.onChange([ ...field.value, data]);
                        }} buttonType="primary" buttonSize="xs">Add Storefront</Button>
                    </div></>
                 )}/>
                <Button type="submit" fullWidth buttonSize="l" buttonType="primary" disabled={formState.isSubmitting || !formState.isDirty}>
                    Save settings
                </Button>
            </Form>
        </Canvas>
    );
}