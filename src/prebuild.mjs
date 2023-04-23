import { writeFileSync } from "node:fs";
import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

console.log("Loading GOOGLE_APPLICATION_CREDENTIALS");

const vailidate = z
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
    })
  )
  .transform((value) => JSON.stringify(value));

const parsed = vailidate.safeParse(
  process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
);

if (parsed.success === false) {
  console.error(
    "❌ Invalid environment variables:",
    parsed.error.flatten().fieldErrors
  );
  throw new Error("Invalid environment variables");
}

writeFileSync("./raptorjunkies.json", parsed.data);
