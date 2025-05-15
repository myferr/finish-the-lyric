import { Embed } from "guilded.js";

module.exports = {
  name: "help",
  aliases: ["h", "commands", "list"],
  execute: (msg) => {
    const e = new Embed()
      .setTitle("Help")
      .setDescription("All commands.")
      .setColor("GREEN")
      .setFooter("+help <commmand> for more information about a command")
      .setTimestamp()
      .addFields([
        {
          name: "**Economy**",
          value: "`+shop` - Shop\n\n`+points` - View your points balance",
          inline: true,
        },
        {
          name: "**General**",
          value:
            "`+guess` - Guess correctly to earn points\n\n`+artists` - View all artists",
          inline: true,
        },
        {
          name: "**Other**",
          value:
            "`+github` - View the GitHub repository for the bot\n\n`+servercount` - How many servers is the bot in?",
          inline: true,
        },
      ]);
    msg.reply(e);
  },
};
