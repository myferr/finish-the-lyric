const { argv } = require("process");
const yaml = require("js-yaml");
const fs = require("fs");
const { Collection } = require("@discordjs/collection");
const { readdir } = require("fs/promises");
const { join } = require("path");
const { Client } = require("guilded.js");

const envPath = join(__dirname, "../env.yml");
const env = yaml.load(fs.readFileSync(envPath, "utf8")) as any;

if (!env.API_Secret)
  throw new Error("Please supply a Guilded API token in your env.yml file.");

const isCanary = argv.includes("--canary");

const secret = isCanary ? env.Canary_API_Secret : env.API_Secret;

if (!secret) {
  throw new Error(
    `Please supply a ${
      isCanary ? "Canary" : "Production"
    } Guilded API token in your env.yml file.`
  );
}

const defaultPrefix = isCanary ? env.canary_prefix : env.prefix;

const client = new Client({ token: secret });
const commands = new Collection();

const prefixPath = join(__dirname, "STORAGE/prefixes.json");
function readPrefixes(): Record<string, string> {
  if (!fs.existsSync(prefixPath)) fs.writeFileSync(prefixPath, "{}");
  return JSON.parse(fs.readFileSync(prefixPath, "utf-8"));
}

client.on("messageCreated", async (msg: any) => {
  if (!msg.content || !msg.serverId) return;

  const prefixes = readPrefixes();
  const serverPrefix = prefixes[msg.serverId] || defaultPrefix;

  if (!msg.content.startsWith(serverPrefix)) return;

  console.log(`${msg.author.id} --> ${msg.content}`);

  let [commandName, ...args] = msg.content
    .slice(serverPrefix.length)
    .trim()
    .split(/ +/);
  commandName = commandName.toLowerCase();

  const command =
    commands.get(commandName) ??
    commands.find((cmd: any) => cmd.aliases?.includes(commandName));

  if (!command) return;

  try {
    await command.execute(msg, args);
  } catch (err) {
    console.error(err);
    void client.messages.send(
      msg.channelId,
      "❌ There was an error executing that command!"
    );
  }
});

client.on("error", console.error);

client.on("ready", async () => {
  await client.setStatus({
    content: `${defaultPrefix}help | just vibing!`,
    emoteId: 2796430,
  });
  console.log(
    `✅ Guilded bot is ready! (${
      secret == env.Canary_API_Secret ? "Canary mode" : "Default"
    })`
  );
});

void (async () => {
  const mainCommandDir = join(__dirname, "commands");
  const adminCommandDir = join(mainCommandDir, "admin");

  const mainFiles = (
    await readdir(mainCommandDir, { withFileTypes: true })
  ).filter((x: any) => x.name.endsWith(".ts") || x.name.endsWith(".js"));

  const adminFiles = (
    fs.existsSync(adminCommandDir)
      ? await readdir(adminCommandDir, { withFileTypes: true })
      : []
  ).filter((x: any) => x.name.endsWith(".ts") || x.name.endsWith(".js"));

  for (const file of mainFiles) {
    const command = require(join(mainCommandDir, file.name));
    commands.set(command.name, command);
    console.log(`Loaded command: ${file.name}`);
  }

  for (const file of adminFiles) {
    const command = require(join(adminCommandDir, file.name));
    commands.set(command.name, command);
    console.log(`Loaded admin command: ${file.name}`);
  }

  await client.login();
})();

export { env, client };
