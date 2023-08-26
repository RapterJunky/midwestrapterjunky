/// <reference types="@total-typescript/ts-reset"/>
/* eslint-disable @typescript-eslint/consistent-type-imports */

declare module "tw-elements" {
  export declare class Carousel { }
  export declare class ChipsInput {
    constructor(
      el: HTMLElement,
      props?: {
        initialValues?: { tag: string }[];
      },
    );
  }
  export declare function initTE(init: {
    [x: string]: Carousel | ChipsInput;
  }): void;
}
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

declare module "body-scroll-lock" {
  export type BodyScrollOptions = {
    reserveScrollBarGap?: boolean;
    allowTouchMove?: (el: HTMLElement) => boolean;
  };
  /** Disables body scroll while enabling scroll on target element */
  export function disableBodyScroll(
    el: HTMLElement,
    options?: BodyScrollOptions,
  ): void;
  /** Enables body scroll and removing listeners on target element */
  export function enableBodyScroll(
    el: HTMLElement,
    options?: BodyScrollOptions,
  ): void;
  /** Clears all scroll locks */
  export function clearAllBodyScrollLocks(): void;
}

type DotEnv = typeof import("./env.mjs").env;

declare module NodeJS {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ProcessEnv extends DotEnv { }

  type GoogleServiceKey = import("zod").infer<
    typeof import("./env.mjs").serviceKey
  >;
}
