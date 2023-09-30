import { Environment } from "square";
import { z } from "zod";

const serviceKey = z
  .string()
  .transform((arg, ctx) => {
    try {
      return JSON.parse(arg);
    } catch (error) {
      ctx.addIssue({ type: "custom", message: "Invaild Json" });
      return z.NEVER;
    }
  })
  .pipe(
    z.object({
      key_version: z.string().nonempty(),
      type: z.literal("service_account"),
      project_id: z.string().nonempty(),
      private_key_id: z.string().nonempty(),
      private_key: z
        .string()
        .nonempty()
        .startsWith("-----BEGIN PRIVATE KEY-----"),
      client_email: z.string().email(),
      client_id: z.string().nonempty(),
      auth_uri: z.string().url(),
      token_uri: z.string().url(),
      auth_provider_x509_cert_url: z.string().url(),
      client_x509_cert_url: z.string().url(),
    }),
  );

/**
 * Specify your server-side environment variables schema here. This way you can ensure the app isn't
 * built with invalid env vars.
 */
const server = z.object({
  CONFIG_CAT_CONFIG_ID: z.string().uuid(),
  CONFIG_CAT_MANAGEMENT: z.string(),
  CONFIG_CAT_ENV: z.string().uuid(),
  CONFIG_CAT_KEY: z.string(),

  DATOCMS_ENVIRONMENT: z.enum(["dev", "preview", "main"]),
  DATOCMS_API_TOKEN: z.string().min(1),
  DATOCMS_READONLY_TOKEN: z.string(),

  GOOGLE_SERVICE_KEY: serviceKey.transform((value, ctx) => {
    try {
      return JSON.stringify(value);
    } catch (error) {
      ctx.addIssue({ type: "custom", message: "Invaild Json" });
      return z.NEVER;
    }
  }),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_SITE_VERIFICATION: z.string(),
  GOOGLE_CLIENT_ID: z.string().min(1),

  SENDGIRD_API_KEY: z.string().min(1),

  FACEBOOK_CLIENT_SECRET: z.string().min(1),
  FACEBOOK_CLIENT_ID: z.string().min(1),

  SQAURE_ACCESS_TOKEN: z.string().min(1),
  SQUARE_MODE: z.nativeEnum(Environment),
  SQAURE_MERCHANT_ID: z.string().min(1),

  NODE_ENV: z.enum(["development", "test", "production"]),
  USE_JSON_IMAGE: z.string().nullable().optional(),
  POST_EMAIL_NOTIFACTION_TEMPLTE: z.string().min(1),

  REVALIDATE_TOKEN: z.string().min(1),
  PREVIEW_TOKEN: z.string().min(1),
  PLUGIN_TOKEN: z.string().min(1),
  KEYS_TOKEN: z.string().min(1),
  APP_KEY: z.string().min(1),
  SHOP_ID: z.string().min(1),

  NEXTAUTH_URL: z.string().optional(),
  DATABASE_URL: z.string().min(1),

  KV_REST_API_READ_ONLY_TOKEN: z.string(),
  KV_REST_API_TOKEN: z.string(),
  KV_REST_API_URL: z.string(),
  KV_URL: z.string(),

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
  NEXT_PUBLIC_SQUARE_MODE: z.enum(["sandbox", "production"]),

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

  NEXT_PUBLIC_NEW_RELIC_ACCOUNT_ID: z.string(),
  NEXT_PUBLIC_NEW_RELIC_TRUST_KEY: z.string(),
  NEXT_PUBLIC_NEW_RELIC_AGENT_ID: z.string(),
  NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY: z.string(),
  NEXT_PUBLIC_NEW_RELIC_APPLICATION_ID: z.string(),

  NEXT_PUBLIC_FEATURE_FLAGS: z
    .string()
    .transform((value) => value.split(","))
    .optional()
    .default([]),

  NEXT_PUBLIC_SITE_URL: z.string().optional(),
});

/**
 * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
 * middlewares) or client-side so we need to destruct manually.
 *
 * @type {Record<keyof z.infer<typeof server> | keyof z.infer<typeof client>, string | undefined>}
 */
const processEnv = {
  GOOGLE_SITE_VERIFICATION: process.env.GOOGLE_SITE_VERIFICATION,
  CONFIG_CAT_CONFIG_ID: process.env.CONFIG_CAT_CONFIG_ID,
  CONFIG_CAT_ENV: process.env.CONFIG_CAT_ENV,

  POST_EMAIL_NOTIFACTION_TEMPLTE: process.env.POST_EMAIL_NOTIFACTION_TEMPLTE,

  CONFIG_CAT_MANAGEMENT: process.env.CONFIG_CAT_MANAGEMENT,
  CONFIG_CAT_KEY: process.env.CONFIG_CAT_KEY,
  NODE_ENV: process.env.NODE_ENV,
  DATOCMS_READONLY_TOKEN: process.env.DATOCMS_READONLY_TOKEN,
  DATOCMS_API_TOKEN: process.env.DATOCMS_API_TOKEN,
  DATOCMS_ENVIRONMENT: process.env.DATOCMS_ENVIRONMENT,

  USE_JSON_IMAGE: process.env.USE_JSON_IMAGE,

  KV_URL: process.env.KV_URL,
  KV_REST_API_URL: process.env.KV_REST_API_URL,
  KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
  KV_REST_API_READ_ONLY_TOKEN: process.env.KV_REST_API_READ_ONLY_TOKEN,

  GOOGLE_SERVICE_KEY: process.env.GOOGLE_SERVICE_KEY,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

  FACEBOOK_CLIENT_ID: process.env.FACEBOOK_CLIENT_ID,
  FACEBOOK_CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET,

  NEXT_PUBLIC_SQUARE_MODE: process.env.NEXT_PUBLIC_SQUARE_MODE,

  SENDGIRD_API_KEY: process.env.SENDGIRD_API_KEY,

  SQAURE_MERCHANT_ID: process.env.SQAURE_MERCHANT_ID,
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

  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,

  NEXT_PUBLIC_NEW_RELIC_ACCOUNT_ID:
    process.env.NEXT_PUBLIC_NEW_RELIC_ACCOUNT_ID,
  NEXT_PUBLIC_NEW_RELIC_TRUST_KEY: process.env.NEXT_PUBLIC_NEW_RELIC_TRUST_KEY,
  NEXT_PUBLIC_NEW_RELIC_AGENT_ID: process.env.NEXT_PUBLIC_NEW_RELIC_AGENT_ID,
  NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY:
    process.env.NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY,
  NEXT_PUBLIC_NEW_RELIC_APPLICATION_ID:
    process.env.NEXT_PUBLIC_NEW_RELIC_APPLICATION_ID,
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
      parsed.error.flatten().fieldErrors,
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
            : `❌ Attempted to access server-side environment variable '${prop}' on the client`,
        );
      return target[/** @type {keyof typeof target} */ (prop)];
    },
  });
}

export { env, serviceKey };
