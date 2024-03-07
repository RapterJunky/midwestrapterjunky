import pretty from "pino-pretty";
import Pino from "pino";

const stream = pretty({
  colorize: true,

});

export const logger = Pino({
  level: process.env.VERCEL_ENV === "production" ? "info" : "debug",
}, process.env.VERCEL_ENV ? stream : undefined);
