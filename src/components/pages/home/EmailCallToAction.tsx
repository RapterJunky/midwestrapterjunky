import {
  StructuredText,
  type StructuredTextGraphQlResponse,
} from "react-datocms/structured-text";

//import { ChevronRight } from "lucide-react";
import { markRules } from "@lib/structuredTextRules";
import type { Color, ModulerContent } from "@type/page";
import AddEmail from "./EmailSubmitClient";

export interface EmailCallToActionProps extends ModulerContent {
  callToActionMessage: StructuredTextGraphQlResponse;
  background_color: Color | null;
}

export default function EmailCallToAction(props: EmailCallToActionProps) {
  return (
    <section
      style={{
        backgroundColor: props?.background_color?.hex ?? "rgb(63 98 18)",
      }}
      className="flex h-max flex-col items-center justify-center gap-5 pb-3 pt-3 text-white lg:h-52 lg:flex-row"
    >
      <div className="w-3/5 text-center">
        <StructuredText
          customMarkRules={markRules}
          data={props.callToActionMessage}
        />
      </div>
      <AddEmail />
    </section>
  );
}
