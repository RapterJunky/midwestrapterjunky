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
    options?: BodyScrollOptions
  ): void;
  /** Enables body scroll and removing listeners on target element */
  export function enableBodyScroll(
    el: HTMLElement,
    options?: BodyScrollOptions
  ): void;
  /** Clears all scroll locks */
  export function clearAllBodyScrollLocks(): void;
}

declare interface Window {
  te: {
    Carousel: {
      getOrCreateInstance(el: Element): void;
    };
  };
}

type DotEnv = typeof import("./env.mjs").env;
declare module NodeJS {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ProcessEnv extends DotEnv {}
}
