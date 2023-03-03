import type { RenderModalCtx } from "datocms-plugin-sdk";
import { Form, Button, FieldGroup, TextField } from "datocms-react-ui";
import { useForm, Controller } from "react-hook-form";
import { useEffect } from 'react';
import { FaTrash, FaBackward } from 'react-icons/fa';
import ImageSelect from "./ImageSelect";

export interface FormState {
    avatar: string;
    name: string;
    social: { user: string; link: string } | null;
    id: string;
}

const Edit = ({ ctx, setEdit }: { setEdit: React.Dispatch<React.SetStateAction<boolean>>, ctx: RenderModalCtx }) => {
    const isEdit = !!Object.keys(ctx.parameters).length;
    const { control, handleSubmit, watch, formState: { isValid, isSubmitting }, setValue, getValues } = useForm<FormState>({
        defaultValues: ctx.parameters,
    });
    const name = watch("name");
    const social_user = watch("social.user");

    const dropItem = async () => {
        try {
            const check = await ctx.openConfirm({
                title: "Delete Author",
                content: "This author will be removed from the database. This will not affect any other articles that reference this author.",
                choices: [
                    {
                        label: 'Yes',
                        value: true,
                        intent: 'positive',
                    }
                ],
                cancel: {
                    label: 'Cancel',
                    value: false,
                }
            });

            if (!check) return;

            const token = new URLSearchParams(window.location.search).get("token");
            if (!token) throw new Error("Failed to perform action.", { cause: "MISSING_AUTH_TOKEN" });

            const result = await fetch("/api/plugin/authors", {
                method: "DELETE",
                body: JSON.stringify({
                    id: ctx.parameters.id
                }),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            if (!result.ok) throw result;

            ctx.resolve({ type: "delete", id: ctx.parameters.id });
        } catch (error) {
            let code = "";
            if (error instanceof Response) {
                code = error.statusText.toUpperCase().replaceAll(" ", "_");
            }
            console.error(error);
            ctx.alert(`Internal Server Error | CODE: ${code}`);
        }
    }


    const submit = async (state: FormState) => {
        try {
            let social = state.social;
            if (!social?.link || !social?.user) social = null;

            const data = {
                avatar: state.avatar,
                name: state.name,
                social,
                id: state?.id ?? crypto.randomUUID(),
            };

            const token = new URLSearchParams(window.location.search).get("token");
            if (!token) throw new Error("Failed to perform action.", { cause: "MISSING_AUTH_TOKEN" });

            // db update/patch
            const result = await fetch("/api/plugin/authors", {
                method: isEdit ? "PATCH" : "POST",
                body: JSON.stringify(data),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });

            if (!result.ok) throw result;

            ctx.resolve(data);
        } catch (error) {
            if (error instanceof Error) ctx.alert(`${error.message} | CODE: ${error.cause}`);
            if (error instanceof Response) {
                ctx.alert(`${error.status === 500 ? "Internal Server Error" : "Failed to perform action."} | CODE: ${error.statusText.toUpperCase().replaceAll(" ", "_")}`);
            }
            console.error(error);
        }
    }

    useEffect(() => {
        const avatar = getValues("avatar");
        if (name && avatar && avatar.startsWith("https://api.dicebear.com")) {
            setValue("avatar", `https://api.dicebear.com/5.x/initials/png?seed=${encodeURIComponent(name ?? "Author")}`);
        }
    }, [name]);

    return (
        <Form onSubmit={handleSubmit(submit)}>
            <FieldGroup>
                <Controller rules={{ required: "Author's name is required." }} control={control} name="name" render={({ fieldState, field }) => (
                    <TextField error={fieldState.error?.message} placeholder="Enter authors name." hint="Provide a full name." label="Author's name." required id="name" name={field.name} onChange={field.onChange} value={field.value ?? undefined} />
                )} />

                <ImageSelect ctx={ctx} control={control} name={name} />

                <Controller control={control} name="social.user" render={({ fieldState, field }) => (
                    <TextField error={fieldState.error?.message} label="Social Media Username" id="social.user" name={field.name} onChange={field.onChange} value={field.value ?? undefined} />
                )} />

                <Controller rules={{
                    required: {
                        message: "A link is required when a username is provided!",
                        value: !!social_user
                    }
                }} control={control} name="social.link" render={({ fieldState, field }) => (
                    <TextField required={!!social_user} id="social.link" error={fieldState.error?.message} hint="Enter a link of the given author social." label="SocialMedia Link" name={field.name} onChange={field.onChange} value={field.value ?? undefined} />
                )} />

            </FieldGroup>
            <div className="mt-5 flex justify-between">
                {isEdit ? (
                    <Button onClick={dropItem} disabled={isSubmitting} leftIcon={<FaTrash style={{ fill: "var(--lighter-bg-color)" }} />} buttonType="negative">Delete</Button>
                ) : (
                    <Button onClick={() => setEdit(false)} disabled={isSubmitting} leftIcon={<FaBackward style={{ fill: "var(--lighter-bg-color)" }} />} buttonType="negative">Back</Button>
                )}
                <Button buttonType="primary" type="submit" disabled={isSubmitting || !isValid}>Submit</Button>
            </div>
        </Form>
    );
}

export default Edit;