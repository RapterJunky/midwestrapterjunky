import { z } from "zod";
import { Environment } from "square";

/**
 * Specify your server-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars.
 */
const server = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  DATOCMS_READONLY_TOKEN: z.string(),
  DATOCMS_API_TOKEN: z.string().min(1),
  DATOCMS_ENVIRONMENT: z.enum(["dev", "preview", "main"]),

  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),

  SQAURE_ACCESS_TOKEN: z.string().min(1),
  SQUARE_MODE: z.nativeEnum(Environment),

  KEYS_TOKEN: z.string().min(1),
  REVALIDATE_TOKEN: z.string().min(1),
  PREVIEW_TOKEN: z.string().min(1),
  PLUGIN_TOKEN: z.string().min(1),
  APP_KEY: z.string().min(1),
  SHOP_ID: z.string().min(1),

  DATABASE_URL: z.string().min(1),
  NEXTAUTH_URL: z.string(),

  CI: z.coerce.boolean(),
  VERCEL: z.coerce.boolean(),
  VERCEL_ENV: z.enum(["development", "production", "preview"]),
  VERCEL_URL: z.string(),
  VERCEL_REGION: z.string().optional(),
  VERCEL_GIT_PROVIDER: z.enum(["github"]).optional(),
  VERCEL_GIT_REPO_SLUG: z.string().optional(),
  VERCEL_GIT_REPO_OWNER: z.string().optional(),
  VERCEL_GIT_REPO_ID: z.string().optional(),
  VERCEL_GIT_COMMIT_REF: z.string().optional(),
  VERCEL_GIT_COMMIT_SHA: z.string().optional(),
  VERCEL_GIT_COMMIT_MESSAGE: z.string().optional(),
  VERCEL_GIT_COMMIT_AUTHOR_LOGIN: z.string().optional(),
  VERCEL_GIT_COMMIT_AUTHOR_NAME: z.string().optional(),
  VERCEL_GIT_PREVIOUS_SHA: z.string().optional(),
});

/**
 * Specify your client-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars. To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
const client = z.object({
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().min(1),
  NEXT_PUBLIC_SQUARE_APPID: z.string().min(1),
  NEXT_PUBLIC_SQAURE_LOCATION_ID: z.string().min(1),

  NEXT_PUBLIC_VERCEL_ENV: z.enum(["development", "production", "preview"]),
  NEXT_PUBLIC_VERCEL_URL: z.string(),

  NEXT_PUBLIC_VERCEL_GIT_PROVIDER: z.enum(["github"]).optional(),
  NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG: z.string().optional(),
  NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER: z.string().optional(),
  NEXT_PUBLIC_VERCEL_GIT_REPO_ID: z.string().optional(),
  NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF: z.string().optional(),
  NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA: z.string().optional(),
  NEXT_PUBLIC_VERCEL_GIT_COMMIT_MESSAGE: z.string().optional(),
  NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_LOGIN: z.string().optional(),
  NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_NAME: z.string().optional(),
  NEXT_PUBLIC_VERCEL_GIT_PREVIOUS_SHA: z.string().optional(),

  NEXT_PUBLIC_FEATURE_FLAGS: z.string().optional().default(""),
});

/**
 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
 * middlewares) or client-side so we need to destruct manually.
 *
 * @type {Record<keyof z.infer<typeof server> | keyof z.infer<typeof client>, string | undefined>}
 */
const processEnv = {
  NODE_ENV: process.env.NODE_ENV,
  DATOCMS_READONLY_TOKEN: process.env.DATOCMS_READONLY_TOKEN,
  DATOCMS_API_TOKEN: process.env.DATOCMS_API_TOKEN,
  DATOCMS_ENVIRONMENT: process.env.DATOCMS_ENVIRONMENT,

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

  SQAURE_ACCESS_TOKEN: process.env.SQAURE_ACCESS_TOKEN,
  SQUARE_MODE: process.env.SQUARE_MODE,

  KEYS_TOKEN: process.env.KEYS_TOKEN,
  REVALIDATE_TOKEN: process.env.REVALIDATE_TOKEN,
  PREVIEW_TOKEN: process.env.PREVIEW_TOKEN,
  PLUGIN_TOKEN: process.env.PLUGIN_TOKEN,
  APP_KEY: process.env.APP_KEY,
  SHOP_ID: process.env.SHOP_ID,

  DATABASE_URL: process.env.DATABASE_URL,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,

  CI: process.env.CI,
  VERCEL: process.env.VERCEL,
  VERCEL_ENV: process.env.VERCEL_ENV,
  VERCEL_URL: process.env.VERCEL_URL,
  VERCEL_REGION: process.env.VERCEL_REGION,
  VERCEL_GIT_PROVIDER: process.env.VERCEL_GIT_PROVIDER,
  VERCEL_GIT_REPO_SLUG: process.env.VERCEL_GIT_REPO_SLUG,
  VERCEL_GIT_REPO_OWNER: process.env.VERCEL_GIT_REPO_OWNER,
  VERCEL_GIT_REPO_ID: process.env.VERCEL_GIT_REPO_ID,
  VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF,
  VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA,
  VERCEL_GIT_COMMIT_MESSAGE: process.env.VERCEL_GIT_COMMIT_MESSAGE,
  VERCEL_GIT_COMMIT_AUTHOR_LOGIN: process.env.VERCEL_GIT_COMMIT_AUTHOR_LOGIN,
  VERCEL_GIT_COMMIT_AUTHOR_NAME: process.env.VERCEL_GIT_COMMIT_AUTHOR_NAME,
  VERCEL_GIT_PREVIOUS_SHA: process.env.VERCEL_GIT_PREVIOUS_SHA,
  // NEXT_PUBLIC_CLIENTVAR: process.env.NEXT_PUBLIC_CLIENTVAR,

  NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  NEXT_PUBLIC_SQUARE_APPID: process.env.NEXT_PUBLIC_SQUARE_APPID,
  NEXT_PUBLIC_SQAURE_LOCATION_ID: process.env.NEXT_PUBLIC_SQAURE_LOCATION_ID,

  NEXT_PUBLIC_VERCEL_ENV: process.env.NEXT_PUBLIC_VERCEL_ENV,
  NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL,

  NEXT_PUBLIC_VERCEL_GIT_PROVIDER: process.env.NEXT_PUBLIC_VERCEL_GIT_PROVIDER,
  NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG:
    process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_SLUG,
  NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER:
    process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_OWNER,
  NEXT_PUBLIC_VERCEL_GIT_REPO_ID: process.env.NEXT_PUBLIC_VERCEL_GIT_REPO_ID,
  NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF:
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF,
  NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA:
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
  NEXT_PUBLIC_VERCEL_GIT_COMMIT_MESSAGE:
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_MESSAGE,
  NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_LOGIN:
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_LOGIN,
  NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_NAME:
    process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_AUTHOR_NAME,
  NEXT_PUBLIC_VERCEL_GIT_PREVIOUS_SHA:
    process.env.NEXT_PUBLIC_VERCEL_GIT_PREVIOUS_SHA,

  NEXT_PUBLIC_FEATURE_FLAGS: process.env.NEXT_PUBLIC_FEATURE_FLAGS,
};

// Don't touch the part below
// --------------------------

const merged = server.merge(client);

/** @typedef {z.input<typeof merged>} MergedInput */
/** @typedef {z.infer<typeof merged>} MergedOutput */
/** @typedef {z.SafeParseReturnType<MergedInput, MergedOutput>} MergedSafeParseReturn */

let env = /** @type {MergedOutput} */ (process.env);

if (!!process.env.SKIP_ENV_VALIDATION == false) {
  const isServer = typeof window === "undefined";

  const parsed = /** @type {MergedSafeParseReturn} */ (
    isServer
      ? merged.safeParse(processEnv) // on server we can validate all env vars
      : client.safeParse(processEnv) // on client we can only validate the ones that are exposed
  );

  if (parsed.success === false) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
    );
    throw new Error("Invalid environment variables");
  }

  env = new Proxy(parsed.data, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      // Throw a descriptive error if a server-side env var is accessed on the client
      // Otherwise it would just be returning `undefined` and be annoying to debug
      if (!isServer && !prop.startsWith("NEXT_PUBLIC_"))
        throw new Error(
          process.env.NODE_ENV === "production"
            ? "❌ Attempted to access a server-side environment variable on the client"
            : `❌ Attempted to access server-side environment variable '${prop}' on the client`
        );
      return target[/** @type {keyof typeof target} */ (prop)];
    },
  });
}

export { env };
