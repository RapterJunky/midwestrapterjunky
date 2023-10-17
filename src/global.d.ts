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

declare module "mammoth/mammoth.browser.min" {
  export default (await import("mammoth")).default;
}

declare module "mammoth/mammoth.browser" {
  export default (await import("mammoth")).default;
}

type DotEnv = typeof import("./env.mjs").env;

declare module NodeJS {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ProcessEnv extends DotEnv {}

  type GoogleServiceKey = import("zod").infer<
    typeof import("./env.mjs").serviceKey
  >;
}
