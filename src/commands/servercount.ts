import { Embed } from "guilded.js";
import { client } from "../";

module.exports = {
  name: "servercount",
  aliases: ["servers", "guilds", "teamcount"],
  execute: async (msg: any) => {
    const servers = await client.fetchServers();
    const count = servers.size;

    const e = new Embed()
      .setTitle("Server count")
      .setDescription(
        "I am currently in `" + count + "` " + `server${count !== 1 ? "s" : ""}`
      )
      .setColor("GREEN")
      .setFooter("https://guilded.gg/app")
      .setTimestamp();

    msg.reply(e);
  },
};
