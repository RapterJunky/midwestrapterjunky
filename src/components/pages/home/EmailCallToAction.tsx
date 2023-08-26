import {
  StructuredText,
  type StructuredTextGraphQlResponse,
} from "react-datocms/structured-text";

import { ChevronRight } from "lucide-react";
import { markRules } from "@lib/structuredTextRules";
import type { Color, ModulerContent } from "@type/page";
import { Button } from "@components/ui/button";
import { Input } from "@components//ui/input";

export interface EmailCallToActionProps extends ModulerContent {
  callToActionMessage: StructuredTextGraphQlResponse;
  background_color: Color | null;
};

export default function EmailCallToAction(props: EmailCallToActionProps) {
  console.log(props);
  return (
    <section
      style={{
        backgroundColor: props?.background_color?.hex ?? "rgb(63 98 18)",
      }}
      className="flex h-max flex-col items-center justify-center gap-5 pb-3 pt-3 text-white lg:h-52 lg:flex-row"
    >
      <div className="w-3/5 text-center">
        <StructuredText customMarkRules={markRules} data={props.callToActionMessage} />
      </div>
      <form
        className="flex w-3/4 justify-center gap-5 from-white sm:w-2/5"
        action="/api/submit-email"
        method="post"
      >
        <Input className="bg-opacity-0 placeholder:text-white border-t-0 border-r-0 border-l-0 rounded-none focus-visible:rounded-sm focus-visible:ring-0" name="email" placeholder="Enter email" type="email" required />
        <Button
          aria-label="Submit Email"
          type="submit"
          variant="ghost"
          className="active:translate-x-1"
        >
          <ChevronRight />
        </Button>
      </form>
    </section>
  );
}
