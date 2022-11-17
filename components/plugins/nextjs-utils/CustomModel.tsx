import { Canvas, TextField, Form, FieldGroup, Button } from 'datocms-react-ui';
import type { RenderModalCtx } from 'datocms-plugin-sdk';
import { Controller, useForm } from 'react-hook-form';
import StringListField from '../StringListField';

export default function CustomModel({ctx}: { ctx: RenderModalCtx }) {
    const { handleSubmit, control } = useForm<{ slug: string; other: string[] }>({
        defaultValues: ctx.parameters
    });

    const submitValues = (value: any) => {
        ctx.resolve(value);
    }
    return (
        <Canvas ctx={ctx}>
            <Form onSubmit={handleSubmit(submitValues)}>
                <FieldGroup>
                    <Controller control={control} 
                        name="slug" 
                        rules={{ required: "Page Slug is required." }}
                        render={({ field: { ref: inputRef, ...field }, fieldState })=>(
                            <TextField {...field} required placeholder='/' error={fieldState.error?.message} id="slug" label="Page Slug" hint="Enter the url fragment"/>
                        )} 
                    />
                </FieldGroup>
                <FieldGroup>
                    <Controller control={control} name="other" render={({ field: { ref: inputRef, ...field } })=>(
                        <StringListField label="Revaildate Others" {...field}/>
                    )}/>
                </FieldGroup>
                <FieldGroup>
                    <Button fullWidth buttonType="primary" type="submit">Submit</Button>
                </FieldGroup>
            </Form>
        </Canvas>
    );
}