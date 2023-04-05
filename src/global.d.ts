/// <reference types="@total-typescript/ts-reset"/>
declare module React {
  type EnterKeyHintOptions = "enter" | "done" | "go" | "next" | "previous" | "search" | "send";
  interface InputHTMLAttributes {
    enterKeyHint?: EnterKeyHintOptions
  }
  interface SelectHTMLAttributes {
    enterKeyHint?: EnterKeyHintOptions
  }
}

declare module "mammoth/mammoth.browser" {
  export default (await import("mammoth")).default;
}

declare module "body-scroll-lock" {
  export type BodyScrollOptions = {
    reserveScrollBarGap?: boolean;
    allowTouchMove?: (el: HTMLElement) => boolean
  }
  /** Disables body scroll while enabling scroll on target element */
  export function disableBodyScroll(el: HTMLElement, options?: BodyScrollOptions): void;
  /** Enables body scroll and removing listeners on target element */
  export function enableBodyScroll(el: HTMLElement, options?: BodyScrollOptions): void;
  /** Clears all scroll locks */
  export function clearAllBodyScrollLocks(): void;
}

declare interface Window {
  te: any;
}

declare module NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_FEATURE_FLAGS: string;
    GOOGLE_CLIENT_ID: string;
    GOOGLE_CLIENT_SECRET: string;
    NEXT_PUBLIC_GA_MEASUREMENT_ID: string;
    DATOCMS_READONLY_TOKEN: string;
    DATOCMS_API_TOKEN: string;
    DATOCMS_ENVIRONMENT: "dev" | "main";
    KEYS_TOKEN: string;
    REVALIDATE_TOKEN: string;
    PREVIEW_TOKEN: string;
    PLUGIN_TOKEN: string;
    APP_KEY: string;

    DATABASE_URL: string;

    VERCEL: 1 | 0;
    CI: "true" | "false";
    VERCEL_ENV: "production" | "preview" | "development";
    VERCEL_URL: string;
    VERCEL_REGION: string;
    VERCEL_GIT_PROVIDER: "github";
    VERCEL_GIT_REPO_SLUG: string;
    VERCEL_GIT_REPO_OWNER: string;
    VERCEL_GIT_REPO_ID: string;
    VERCEL_GIT_COMMIT_REF: string;
    VERCEL_GIT_COMMIT_SHA: string;
    VERCEL_GIT_COMMIT_MESSAGE: string;
    VERCEL_GIT_COMMIT_AUTHOR_LOGIN: string;
    VERCEL_GIT_COMMIT_AUTHOR_NAME: string;
    VERCEL_GIT_PREVIOUS_SHA: string;

    NEXT_PUBLIC_VERCEL_ENV: string;
    NEXT_PUBLIC_VERCEL_URL: string;
    NEXT_PUBLIC_VERCEL_GIT_PROVIDER: string;
    NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG;
    NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER: string;
    NEXT_PUBLIC_VERCEL_GIT_REPO_ID: string;
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF: string;
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: string;
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_MESSAGE: string;
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_LOGIN: string;
    NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_NAME: string;
    NEXT_PUBLIC_VERCEL_GIT_PREVIOUS_SHA: string;
  }
}
