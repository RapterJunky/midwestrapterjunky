/// <reference types="@total-typescript/ts-reset"/>

/* eslint-disable @typescript-eslint/consistent-type-imports */
declare module React {
  type EnterKeyHintOptions =
    | "enter"
    | "done"
    | "go"
    | "next"
    | "previous"
    | "search"
    | "send";
  interface InputHTMLAttributes {
    enterKeyHint?: EnterKeyHintOptions;
  }
  interface SelectHTMLAttributes {
    enterKeyHint?: EnterKeyHintOptions;
  }
}

type Mammoth = () => typeof import("mammoth");
declare module "mammoth/mammoth.browser.min" {
  export { default } from "mammoth";
}

declare module "mammoth/mammoth.browser" {
  export { default } from "mammoth";
}

type DotEnv = typeof import("./env.mjs").env;

declare module NodeJS {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ProcessEnv extends DotEnv {}

  type GoogleServiceKey = import("zod").infer<
    typeof import("./env.mjs").serviceKey
  >;
}
