import { Embed } from "guilded.js";
import { getUserPoints } from "../STORAGE/utils";

module.exports = {
  name: "github",
  aliases: ["gh"],
  execute: (msg: any) => {
    const e = new Embed()
      .setTitle("GitHub Repository")
      .setDescription("The GitHub repository for the bot.")
      .setColor("GREEN")
      .setFooter("https://guilded.gg/app")
      .setTimestamp()
      .addFields([
        {
          name: "**Link**",
          value: `[🔗 Here](https://github.com/myferr/finish-the-lyric)`,
          inline: false,
        },
      ]);
    msg.reply(e);
  },
};
