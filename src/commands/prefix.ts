import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const prefixPath = join(__dirname, "../STORAGE/prefixes.json");

function readPrefixes(): Record<string, string> {
  if (!existsSync(prefixPath)) writeFileSync(prefixPath, "{}");
  return JSON.parse(readFileSync(prefixPath, "utf-8"));
}

function writePrefixes(data: Record<string, string>) {
  writeFileSync(prefixPath, JSON.stringify(data, null, 2));
}

module.exports = {
  name: "prefix",
  aliases: [],
  description: "View or change the bot's command prefix for this server.",
  execute: async (msg: any, args: string[]) => {
    const serverId = msg.serverId;
    const authorId = msg.author.id;

    if (!serverId) return msg.reply("❌ This command only works in servers.");

    const prefixes = readPrefixes();
    const currentPrefix = prefixes[serverId] || "+";

    // Show current prefix
    if (args.length === 0) {
      return msg.reply(`🔧 The current prefix is \`${currentPrefix}\``);
    }

    // Only the server owner can change the prefix
    const server = await msg.client.servers.fetch(serverId);
    if (server.ownerId !== authorId) {
      return msg.reply("❌ Only the server owner can change the prefix.");
    }

    const newPrefix = args[0];

    if (newPrefix.length > 5) {
      return msg.reply("❌ That prefix is too long. Max 5 characters.");
    }

    prefixes[serverId] = newPrefix;
    writePrefixes(prefixes);

    return msg.reply(`✅ Prefix updated to \`${newPrefix}\``);
  },
};
