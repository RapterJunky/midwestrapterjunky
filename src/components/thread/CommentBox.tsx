import { useForm, Controller } from "react-hook-form";
import type { Descendant } from "slate";
import { useId } from "react";

import TextEditor from "@components/community/editor/TextEditor";
import Spinner from "@/components/ui/Spinner";

import { isEditorEmpty, resetEditor } from "@lib/utils/editor/editorActions";
import type { CreateCommentBody } from "@hook/usePost";

export type CommentBoxFormState = {
  message: Descendant[];
  deletedImages: string[],
};

const CommentBox: React.FC<{
  defaultValues?: () => Promise<CommentBoxFormState>,
  submit: (props: CreateCommentBody) => Promise<boolean>;
  btnText?: string;
}> = ({ submit, defaultValues, btnText = "Reply" }) => {
  const id = useId();
  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors, isLoading },
    setError,
    setValue,
  } = useForm<CommentBoxFormState>({
    defaultValues: defaultValues ?? {
      message: [{ type: "paragraph", children: [{ text: "" }] }],
    },
  });

  const onSubmit = async (state: CommentBoxFormState) => {
    const empty = await isEditorEmpty(id);
    if (empty) {
      return setError("message", {
        type: "min",
        message: "There is nothing to submit.",
      });
    }

    try {
      const result = await submit(state);
      if (result) resetEditor(id);
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="p-2 flex flex-col w-full items-center justify-center not-prose">
        <Spinner size="h-6 w-6" />
        <div className="mt-4">Loading...</div>
      </div>
    );
  }

  return (
    <form
      className="my-6 flex flex-col justify-evenly gap-1 md:px-4 not-prose"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Controller
        control={control}
        name="message"
        render={({ field }) => (
          <TextEditor id={id} value={field.value} onChange={(values) => {
            field.onChange(values.ast);
            setValue("deletedImages", values.deletedImages);
          }} />
        )}
      />
      {errors.message ? (
        <div className="text-red-500">{errors.message.message}</div>
      ) : null}
      <div className="flex w-full justify-end">
        <button
          disabled={isSubmitting}
          type="submit"
          className="inline-block rounded-sm bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-[0_4px_9px_-4px_#3b71ca] transition duration-150 ease-in-out hover:bg-primary-600 hover:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:bg-primary-600 focus:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] focus:outline-none focus:ring-0 active:bg-primary-700 active:shadow-[0_8px_9px_-4px_rgba(59,113,202,0.3),0_4px_18px_0_rgba(59,113,202,0.2)] disabled:pointer-events-none disabled:opacity-70"
        >
          {isSubmitting ? (
            <div className="flex gap-2">
              <Spinner />
              Loading...
            </div>
          ) : (
            <span>{btnText}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default CommentBox;
