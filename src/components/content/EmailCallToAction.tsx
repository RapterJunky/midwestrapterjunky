import { StructuredText } from "react-datocms";
import { HiOutlineChevronRight } from "react-icons/hi";

import { markRules } from "@lib/StructuredTextRules";
import type { Color, StructuredContent } from "@type/page";

interface EmailCallToActionProps {
  data: StructuredContent;
  background_color: Color | null;
}

export default function EmailCallToAction(props: EmailCallToActionProps) {
  return (
    <div
      style={{
        backgroundColor: props?.background_color?.hex ?? "rgb(63 98 18)",
      }}
      className="flex h-max flex-col items-center justify-center gap-5 pt-3 pb-3 text-white lg:h-52 lg:flex-row"
    >
      <div className="w-3/5 text-center">
        <StructuredText customMarkRules={markRules} data={props.data} />
      </div>
      <form
        className="flex w-3/4 justify-center gap-5 from-white sm:w-2/5"
        action="/api/submit-email"
        method="post"
      >
        <input
          name="email"
          placeholder="Enter email"
          className="w-3/4 border-x-0 border-t-0 border-white bg-transparent text-white ring-0 placeholder:text-zinc-300 focus:ring-0"
          type="email"
          required
        />
        <button
          role="button"
          aria-label="Submit Email"
          type="submit"
          className="active:translate-x-1"
        >
          <HiOutlineChevronRight className="text-2xl font-bold text-white" />
        </button>
      </form>
    </div>
  );
}
