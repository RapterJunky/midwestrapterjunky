import { Controller, type ControllerProps, type FieldPath, type FieldValues } from 'react-hook-form';
import dynamic from "next/dynamic";

const TextEditor = dynamic(() => import("@components/community/editor/TextEditor"), {
    loading: () => (
        <div className="animate-pulse">
            <span className="inline-block h-12 w-full flex-auto cursor-wait bg-current align-middle text-base text-neutral-700 opacity-50"></span>
            <span className="inline-block h-28 w-full flex-auto cursor-wait bg-current align-middle text-base text-neutral-700 opacity-50"></span>
        </div>
    )
});

const CommentBox = <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({ name, control }: Omit<ControllerProps<TFieldValues, TName>, "render">) => {
    return (
        <Controller control={control} name={name} render={({ field }) => (
            <TextEditor value={field.value} onChange={field.onChange} />
        )}
        />
    );
}

export default CommentBox;