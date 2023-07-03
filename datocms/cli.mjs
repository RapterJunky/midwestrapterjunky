import { readdir, readFile } from "node:fs/promises";
import { dirname, join, parse } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { argv, env } from "node:process";
import { Client } from "@datocms/cma-client-node";
/**
 * @typedef {{
 * flags: { name: string; type: "boolean" | "number" | "string"; default: unknown }[]
 * subcommands: Array<{ name: string; description: string; }>,
 * exec: {
 *  [command: string]: (client: import("@datocms/cma-client-node").Client, args: { [key: string]: unknown }) => Promise<void> }
 * }} Command
 */

const __dirname = dirname(fileURLToPath(import.meta.url));

const readEnv = async () => {
  const file = await readFile(join(__dirname, "../.env"), {
    encoding: "utf-8",
  });
  const lines = file.split("\n");

  for (const line of lines) {
    if (line.startsWith("#")) continue;
    const [key, value] = line.split("=");
    env[key] = value;
  }
};

/**
 * @param {string[]} args
 * @param {Command["flags"]} flags
 */
const parseArgs = (args, flags) => {
  const data = {};

  for (let i = 0; i < args.length; i++) {
    if (!args[i].startsWith("--")) continue;

    const flag = flags.find(
      (value) => value.name === args[i].replace("--", "")
    );
    if (!flag) {
      data[args[i].replace("--", "")] = true;
      continue;
    }

    switch (flag.type) {
      case "boolean": {
        const value = args[i + 1]?.startsWith("--")
          ? flag.default
          : args[i + 1] === "true";
        data[flag.name] = value;
        break;
      }
      case "number":
        {
          const value = args[i + 1]?.startsWith("--")
            ? flags.default
            : parseInt(args[i + 1]);
          data[flag.name] = value;
        }
        break;
      case "string": {
        const value = args[i + 1]?.startsWith("--")
          ? flags.default
          : args[i + 1];
        data[flag.name] = value;
        break;
      }
    }
  }

  for (const flag of flags) {
    if (!data[flag.name]) {
      data[flag.name] = flag.default;
    }
  }

  data["path"] = __dirname;

  return data;
};

await readEnv();

if (!env.DATOCMS_API_TOKEN) throw new Error("No api token has been set.");

const client = new Client({
  apiToken: env.DATOCMS_API_TOKEN,
});

/** @type {Map<string,Command>} */
const commands = new Map();

const files = await readdir(join(__dirname, "./commands"));
for (const file of files) {
  try {
    const filepath = join(__dirname, "commands", file);
    const data = await import(pathToFileURL(filepath));
    const filename = parse(filepath);
    commands.set(filename.name, data.default);
  } catch (error) {
    console.error(error);
    console.error(`Failed to loaded command from file ${file}`);
  }
}
// 3 root command
// 4 sub command
// 5+ flags flagArg
const args = argv.slice(2);

if (args[0] === "help") {
  commands.forEach((value, key) => {
    console.log(`${key}`);
    value.subcommands.forEach((item) => {
      console.log(`--- ${item.name} | ${item.description}`);
    });
  });
} else {
  const command = commands.get(args[0]);

  if (!command) {
    throw new Error("No Command was given. use help to list commands.");
  }

  const flags = parseArgs(args.slice(1), command.flags);

  if (args[1].startsWith("--")) {
    await command.exec.default(client, flags);
  } else {
    const subcommand = command.subcommands.find(
      (value) => value.name === args[1]
    );
    if (!subcommand) throw new Error("No subcommand was founded.");
    await command.exec[subcommand.name](client, flags);
  }
}
