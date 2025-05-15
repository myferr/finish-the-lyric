const yaml = require("js-yaml");
const fs = require("fs");
const { Collection } = require("@discordjs/collection");
const { readdir } = require("fs/promises");
const { join } = require("path");
const { Client } = require("guilded.js");

const envPath = join(__dirname, "../env.yml");
const env = yaml.load(fs.readFileSync(envPath, "utf8"));

if (!env.API_Secret)
  throw new Error("Please supply a Guilded API token in your env.yml file.");

const client = new Client({ token: env.API_Secret });
const prefix = env.prefix;
const commands = new Collection();

client.on("messageCreated", async (msg: any) => {});

client.on("messageCreated", async (msg: any) => {
  if (!msg.content.startsWith(prefix)) return;
  console.log(msg.authorId + " - " + msg.content);
  let [commandName, ...args] = msg.content
    .slice(prefix.length)
    .trim()
    .split(/ +/);
  commandName = commandName.toLowerCase();

  const command =
    commands.get(commandName) ??
    commands.find((x: any) => x.aliases?.includes(commandName));
  if (!command) return;

  try {
    await command.execute(msg, args);
  } catch (e) {
    void client.messages.send(
      msg.channelId,
      "There was an error executing that command!"
    );
    void console.error(e);
  }
});

client.on("error", console.log);
client.on(
  "ready",
  async () =>
    await client.setStatus({
      content: `just vibing!`,
      emoteId: 2796430,
    }),
  console.log(`Guilded bot is ready!\n\nPREFIX: ${prefix}`)
);
client.on("exit", () => console.log("Disconnected!"));

void (async () => {
  const commandDir = await readdir(join(__dirname, "commands"), {
    withFileTypes: true,
  });

  const adminCommandDir = await readdir(join(__dirname, "commands", "admin"), {
    withFileTypes: true,
  });

  for (const file of commandDir.filter((x: any) => x.name.endsWith(".ts"))) {
    console.log(file.name);
    const command = require(join(__dirname, "commands", file.name));
    commands.set(command.name, command);
  }

  for (const file of adminCommandDir.filter((x: any) =>
    x.name.endsWith(".ts")
  )) {
    console.log(`admin command: ${file.name}`);
    const command = require(join(__dirname, "commands", "admin", file.name));
    commands.set(command.name, command);
  }

  client.login();
})();

export { env, client };
