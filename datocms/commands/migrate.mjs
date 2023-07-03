import { join, resolve, relative } from "node:path";
import { access, readdir } from "node:fs/promises";

/**
 * @typedef {{
 * flags: { name: string; type: "boolean" | "number" | "string"; default: unknown }[]
 * subcommands: Array<{ name: string; description: string; }>,
 * exec: {
 *  [command: string]: (client: import("@datocms/cma-client-node").Client, args: { [key: string]: unknown }) => Promise<void> }
 * }} Command
 */

/** @type {Command} */
const command = {
  subcommands: [
    { name: "new", description: "Create a new migration script" },
    { name: "run", description: "Run migration scripts that have not run yet" },
  ],
  flags: [
    { name: "up", default: false, type: "boolean" },
    { name: "down", default: false, type: "boolean" },
    { name: "autogenerate", default: null, type: "string" },
    { name: "name", default: null, type: "string" },
    { name: "dry-run", default: false, type: "boolean" },
    { name: "fast-fork", default: false, type: "boolean" },
    { name: "in-place", default: false, type: "boolean" },
    { name: "force", default: false, type: "boolean" },
    { name: "destination", default: null, type: "string" },
    { name: "source", default: null, type: "string" },
  ],
  exec: {
    new: async (client, args) => {
      try {
        if (!args.name) throw new Error("Missing name argument.");
      } catch (error) {
        console.error(error.message);
      }
    },
    run: async (client, args) => {
      try {
        const dryRun = args["dry-run"];
        const inPlace = args["inPlace"];
        const fastFork = args["fastFork"];
        const force = args.force;
        const up = args.up;
        const down = args.down;
        const source = args.source;
        const destination = args.destination;
        const migrationPath = join(args.path, "../migrations");

        await access(migrationPath).catch(() => {
          throw new Error(`Directory "${migrationPath}" does not exist!`);
        });

        const allEnvironments = await client.environments.list();
        const primaryEnv = allEnvironments.find((env) => env.meta.primary);

        const sourceEnv = source
          ? await client.environments.find(source)
          : primaryEnv;

        if (!sourceEnv) {
          throw new Error(
            `You have no permissions to access the "${
              source ? `"${source}"` : `primary`
            } environment!"`
          );
        }

        let destinationEnvId = inPlace
          ? sourceEnv.id
          : destination ?? `${sourceEnv.id}-post-migrations`;

        console.log(
          `Migrations will be run in "${destinationEnvId}" sandbox environment`
        );

        if (inPlace) {
          if (primaryEnv && primaryEnv.id === destinationEnvId) {
            throw new Error(
              "Running migrations on primary environment is not allowed!"
            );
          }
        } else {
          destinationEnvId = await client.environments.fork(
            sourceEnv.id,
            {},
            {
              force: focus,
              immediate_return: dryRun,
              fast: fastFork,
            }
          );
        }
      } catch (error) {
        console.error(error.message);
      }
    },
  },
};

export default command;
