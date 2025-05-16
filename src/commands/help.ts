import { Embed } from "guilded.js";

module.exports = {
  name: "help",
  aliases: ["h", "commands", "list"],
  execute: (msg: any, args: any) => {
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
        usage: "`+github`",
      },
      guess: {
        description: "Guess correctly to earn points",
        aliases: ["g", "play", "lyrics"],
        usage: "`+guess <lyrics | song | undefined>`",
      },
      help: {
        description: "Show a list of commands",
        aliases: ["h", "commands", "list"],
        usage: "`+help <command?: string>`",
      },
      leaderboard: {
        description: "View global leaderboard",
        aliases: ["lb", "top", "ranks"],
        usage: "`+leaderboard`",
      },
      points: {
        description: "View your points balance",
        aliases: ["p", "bal"],
        usage: "`+points`",
      },
      servercount: {
        description: "How many servers is the bot in?",
        aliases: ["servers", "guilds", "teamcount"],
        usage: "`+servercount`",
      },
      shop: {
        description: "View shop",
        aliases: ["s", "store", "market"],
        usage: "`+shop <category?: string>`",
      },
    };

    const argsJoined = args.join(" ");
    const e = new Embed()
      .setTitle("Help")
      .setDescription("All commands.")
      .setColor("GREEN")
      .setFooter("+help <commmand> for more information about a command")
      .setTimestamp()
      .addFields([
        {
          name: "**Economy**",
          value:
            "`+points` - View your points balance\n\n`+leaderboard` - View global leaderboard\n\n`+shop` - View shop",
          inline: true,
        },
        {
          name: "**General**",
          value:
            "`+help` - Show a list of commands\n\n`+guess` - Guess correctly to earn points",
          inline: true,
        },
        {
          name: "\n\n**Other**",
          value:
            "`+github` - View the GitHub repository for the bot\n\n`+servercount` - How many servers is the bot in?",
          inline: false,
        },
      ]);
    if (argsJoined) {
      const e2 = new Embed()
        .setTitle(`Help - ${args[0]}`)
        .setDescription("Extended description on " + args[0])
        .setColor("GREEN")
        .setFooter("https://guilded.gg/app")
        .setTimestamp()
        .addFields([
          {
            name: "\n**Description**",
            value: `${commands[args[0]].description}`,
            inline: true,
          },
          {
            name: "\n**Aliases**",
            value: `${commands[args[0]].aliases.map(
              (i) => ` ${"`"}${i}${"`"}`
            )}`,
            inline: true,
          },
          {
            name: "\n**Usage**",
            value: `${commands[args[0]].usage}`,
            inline: false,
          },
        ]);
      msg.reply(e2);
    } else {
      msg.reply(e);
    }
  },
};
