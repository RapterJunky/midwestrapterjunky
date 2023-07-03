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
    { name: "off", description: "Take a project out of maintenance mode" },
    { name: "on", description: "Put a project in maintenance mode" },
  ],
  flags: [{ name: "force", type: "boolean", default: false }],
  exec: {
    on: async (client, args) => {
      try {
        const result = await client.maintenanceMode.activate({
          force: args.force ?? false,
        });

        console.log(
          `Type: ${result.type} Id: ${result.id} Active: ${result.active}`
        );
      } catch (error) {
        console.error(
          `Cannot activate maintenance mode as some users are currently editing records. To proceed anyway, use the --force flag: (${error.message})`
        );
      }
    },
    off: async (client, args) => {
      try {
        const result = await client.maintenanceMode.deactivate();
        console.log(
          `Type: ${result.type} Id: ${result.id} Active: ${result.active}`
        );
      } catch (error) {
        console.error(
          `Failed to deactivate maintenance mode. (${error.message})`
        );
      }
    },
  },
};

export default command;
