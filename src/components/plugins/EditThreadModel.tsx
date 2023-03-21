import type { RenderModalCtx } from "datocms-plugin-sdk";
import { Canvas, TextField, Button } from "datocms-react-ui";
import { useForm, Controller } from 'react-hook-form';

interface State {
    name: string;
    description: string;
    id: number;
}

const EditThreadModel: React.FC<{ ctx: RenderModalCtx }> = ({ ctx }) => {
    const { control, handleSubmit } = useForm<State>({
        defaultValues: {
            name: ctx.parameters.type === "edit" ? (ctx.parameters as { data: State })?.data.name : "",
            description: ctx.parameters.type === "edit" ? (ctx.parameters as { data: State })?.data.description : "",
            id: ctx.parameters.type === "edit" ? (ctx.parameters as { data: State })?.data.id : -1,
        }
    });
    const onSubmit = (state: State) => ctx.resolve(state);
    return (
        <Canvas ctx={ctx}>
            <form onSubmit={handleSubmit(onSubmit)}>
                <Controller rules={{ required: "A name is required." }} control={control} name="name" render={({ fieldState: { error }, field: { onChange, value, name } }) => (
                    <TextField required placeholder="name" error={error?.message} id="name" name={name} label="Thread Name" value={value} onChange={onChange} />
                )} />
                <div className="mt-dato-l">
                    <Controller control={control} name="description" render={({ fieldState: { error }, field: { onChange, value, name } }) => (
                        <TextField placeholder="description" error={error?.message} id={name} name={name} label="Thread Description" value={value} onChange={onChange} />
                    )} />
                </div>
                <Button type="submit" fullWidth buttonType="primary" className="mt-dato-l">Submit</Button>
            </form>
        </Canvas>
    );
}

export default EditThreadModel;