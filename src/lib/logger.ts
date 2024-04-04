import Pino from "pino";
import pretty from "pino-pretty";

const stream = pretty({
  colorize: true,
});

export const logger = Pino(
  {
    level: process.env.VERCEL_ENV === "production" ? "info" : "debug",
  },
  process.env.VERCEL_ENV ? stream : undefined,
);
