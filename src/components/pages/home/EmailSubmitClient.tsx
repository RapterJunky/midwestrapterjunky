"use client";
import { useFormState, useFormStatus } from "react-dom";
import { ChevronRight } from "lucide-react";
import submitEmail from "@lib/actions/submit_email";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Spinner from "@/components/ui/Spinner";

const initialState = {
  error: null,
};

function SubmitBtn() {
  const { pending } = useFormStatus();

  return (
    <div className="mb-2 flex w-full gap-5">
      <Input
        disabled={pending}
        aria-disabled={pending}
        className="rounded-none border-l-0 border-r-0 border-t-0 bg-opacity-0 placeholder:text-white focus-visible:rounded-sm focus-visible:ring-0 disabled:hover:cursor-progress"
        name="email"
        placeholder="Enter email"
        type="email"
        required
      />
      <Button
        disabled={pending}
        aria-disabled={pending}
        aria-label="Submit Email"
        type="submit"
        variant="ghost"
        className="active:translate-x-1 disabled:hover:cursor-progress"
      >
        {pending ? <Spinner className="h-5 w-5" /> : <ChevronRight />}
      </Button>
    </div>
  );
}

export default function AddEmail() {
  const [state, formAction] = useFormState(submitEmail, initialState);

  return (
    <form
      action={formAction as never}
      className="flex w-3/4 flex-col justify-center from-white sm:w-2/5 lg:mr-2"
    >
      <SubmitBtn />
      <p
        aria-live="assertive"
        className="text-sm font-medium text-red-500 dark:text-red-900"
      >
        {(state as { error: string })?.error}
      </p>
    </form>
  );
}
