import type { NonTextNode, Text } from "datocms-structured-text-slate-utils";
import type { BaseEditor, BaseRange } from "slate";
import type { ReactEditor } from "slate-react";

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: NonTextNode;
    Text: Text;
    Range: BaseRange & {
      emoji?: string;
      codeToken?: string;
    };
  }
}
