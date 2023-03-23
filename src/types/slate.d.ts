import type { BaseEditor, BaseRange } from "slate";
import type { ReactEditor } from "slate-react";
import { NonTextNode, Text } from 'datocms-structured-text-slate-utils';

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
