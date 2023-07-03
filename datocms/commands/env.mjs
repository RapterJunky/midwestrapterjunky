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
    { name: "destory", description: "Destroys a sandbox environment" },
    {
      name: "fork",
      description:
        "Creates a new sandbox environment by forking an existing one",
    },
    {
      name: "list",
      description: "Lists primary/sandbox environments of a projec",
    },
    {
      name: "primary",
      description: "Returns the name of the primary environment of a project",
    },
    {
      name: "promote",
      description: "Promotes a sandbox environment to primary",
    },
  ],
  flags: [
    { name: "envId", type: "string", default: null },
    { name: "source", type: "string", default: null },
    { name: "fast", type: "boolean", default: false },
    { name: "force", type: "boolean", default: false },
  ],
  exec: {
    destory: async (client, args) => {
      try {
        if (!args.envId) throw new Error("Missing environment id");

        const result = await client.environments.destroy(args.envId);

        console.log(`Type: ${result.type} Id: ${result.id}`);
        console.log(`Created At: ${result.meta.created_at}
                            Status: ${result.meta.status}
                            Fork completion Percentage: ${result.meta.fork_completion_percentage}
                            Forked From: ${result.meta.forked_from}
                            Last Data Change at: ${result.meta.last_data_change_at}
                            Primary: ${result.meta.primary}
                            Ready only mode: ${result.meta.read_only_mode}
                `);
      } catch (error) {
        console.error(error.message);
      }
    },
    fork: async (client, args) => {
      try {
        if (!args.source || !args.envId)
          throw new Error("Missing arguments source or envId");

        const sourceEnv = await client.environments.find(args.source);

        console.log(
          `Starting a ${args.fast ? "fast " : ""}fork of ${sourceEnv.id}`
        );

        const env = await client.environments.fork(
          sourceEnv.id,
          {
            id: args.envId,
          },
          {
            fast: args.fast,
            force: args.force,
          }
        );

        console.log(`Type: ${env.type} Id: ${env.id}`);
        console.log(JSON.stringify(env.meta));
      } catch (error) {
        console.error(error.message);
      }
    },
    list: async (client, args) => {
      try {
        const env = await client.environments.list();

        const out = env.map((value) => ({
          id: value.id,
          primary: value.meta.primary,
          status: value.meta.status,
          created_at: value.meta.created_at,
          last_datachange_at: value.meta.last_data_change_at,
        }));

        console.table(out);
      } catch (error) {
        console.error(error.message);
      }
    },
    primary: async (client, args) => {
      try {
        const environments = await client.environments.list();
        const primary = environments.find((e) => e.meta.primary);

        console.log(primary.id);
      } catch (error) {
        console.error(error.message);
      }
    },
    promote: async (client, args) => {
      try {
        if (!args.envId) throw new Error("Missing env id");

        const result = await client.environments.promote(args.envId);

        console.log(
          `Id: ${result.id} Type: ${result.type} Primary: ${result.meta.primary}`
        );
      } catch (error) {
        console.error(error.message);
      }
    },
  },
};

export default command;
