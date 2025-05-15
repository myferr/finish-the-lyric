import { Embed } from "guilded.js";
import { getUserPoints } from "../STORAGE/utils";

module.exports = {
  name: "points",
  aliases: ["p", "bal"],
  execute: (msg: any) => {
    const e = new Embed()
      .setTitle("Points")
      .setDescription("Your current points.")
      .setColor("GREEN")
      .setFooter("https://guilded.gg/app")
      .setTimestamp()
      .addFields([
        {
          name: "**Balance**",
          value: `You have **${getUserPoints(msg.author.id)} points**`,
          inline: false,
        },
      ]);
    msg.reply(e);
  },
};
