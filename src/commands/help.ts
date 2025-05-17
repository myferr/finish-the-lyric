import { Embed } from "guilded.js";
import { readFileSync, existsSync, writeFileSync } from "fs";
import { join } from "path";

const prefixPath = join(__dirname, "../STORAGE/prefixes.json");

function readPrefixes(): Record<string, string> {
  if (!existsSync(prefixPath)) {
    writeFileSync(prefixPath, "{}");
  }
  return JSON.parse(readFileSync(prefixPath, "utf-8"));
}

module.exports = {
  name: "help",
  aliases: ["h", "commands", "list"],
  execute: (msg: any, args: string[]) => {
    const serverId = msg.serverId;
    const prefixes = readPrefixes();
    const currentPrefix = (serverId && prefixes[serverId]) || "+";

    const commands: {
      [name: string]: {
        description: string;
        aliases: string[];
        usage: string;
      };
    } = {
      github: {
        description: "View the GitHub repository for the bot",
        aliases: ["gh"],
        usage: `\`${currentPrefix}github\``,
      },
      guess: {
        description: "Guess correctly to earn points",
        aliases: ["g", "play", "lyrics"],
        usage: `\`${currentPrefix}guess <lyrics | song | undefined>\``,
      },
      help: {
        description: "Show a list of commands",
        aliases: ["h", "commands", "list"],
        usage: `\`${currentPrefix}help <command?: string>\``,
      },
      leaderboard: {
        description: "View global leaderboard",
        aliases: ["lb", "top", "ranks"],
        usage: `\`${currentPrefix}leaderboard\``,
      },
      points: {
        description: "View your points balance",
        aliases: ["p", "bal"],
        usage: `\`${currentPrefix}points\``,
      },
      servercount: {
        description: "How many servers is the bot in?",
        aliases: ["servers", "guilds", "teamcount"],
        usage: `\`${currentPrefix}servercount\``,
      },
      shop: {
        description: "View shop",
        aliases: ["s", "store", "market"],
        usage: `\`${currentPrefix}shop <category?: string>\``,
      },
      buy: {
        description: "Buy an item from the shop",
        aliases: [],
        usage: `\`${currentPrefix}buy <category: string> <item: number>\``,
      },
      daily: {
        description: "Get a daily reward",
        aliases: ["claim"],
        usage: `\`${currentPrefix}daily\``,
      },
      inventory: {
        description: "View your cosmetics and boosts",
        aliases: ["inv", "bag", "items"],
        usage: `\`${currentPrefix}inventory\``,
      },
      prefix: {
        description: "View or change the bot's command prefix for this server",
        aliases: ["p", "changePrefix"],
        usage: `\`${currentPrefix}prefix [newPrefix?]\``,
      },
    };

    const argsJoined = args.join(" ");
    const e = new Embed()
      .setTitle("Help")
      .setDescription("All commands.")
      .setColor("GREEN")
      .setFooter(`${currentPrefix}help <command> for more info`)
      .setTimestamp()
      .addFields([
        {
          name: "**Economy**",
          value: [
            `\`${currentPrefix}guess\` — Guess lyrics to earn points`,
            `\`${currentPrefix}leaderboard\` — View global leaderboard`,
            `\`${currentPrefix}shop\` — View shop`,
            `\`${currentPrefix}buy\` — Buy an item from the shop`,
            `\`${currentPrefix}daily\` — Get a daily reward`,
          ].join("\n\n"),
          inline: true,
        },
        {
          name: "**General**",
          value: [
            `\`${currentPrefix}help\` — Show a list of commands`,
            `\`${currentPrefix}inventory\` — View your cosmetics and boosts`,
            `\`${currentPrefix}points\` — View your points balance`,
            `\`${currentPrefix}prefix\` — Change or view this server's prefix`,
          ].join("\n\n"),
          inline: true,
        },
        {
          name: "**Other**",
          value: `\`${currentPrefix}github\` — View the GitHub repository\n\`${currentPrefix}servercount\` — Bot server count`,
          inline: false,
        },
      ]);

    if (argsJoined && commands[args[0]]) {
      const c = commands[args[0]];
      const e2 = new Embed()
        .setTitle(`Help - ${args[0]}`)
        .setDescription("Extended description on " + args[0])
        .setColor("GREEN")
        .setFooter("https://guilded.gg/app")
        .setTimestamp()
        .addFields([
          {
            name: "**Description**",
            value: c.description,
            inline: true,
          },
          {
            name: "**Aliases**",
            value: c.aliases.length
              ? c.aliases.map((i) => `\`${i}\``).join(", ")
              : "None",
            inline: true,
          },
          {
            name: "**Usage**",
            value: c.usage,
            inline: false,
          },
        ]);
      msg.reply(e2);
    } else {
      msg.reply(e);
    }
  },
};
