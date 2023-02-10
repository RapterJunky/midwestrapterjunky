import Pino from "pino";

export const logger = Pino({
  level: process.env.VERCEL_ENV === "production" ? "info" : "debug",
});
