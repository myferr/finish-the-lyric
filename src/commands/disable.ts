import { Embed } from "guilded.js";
import * as fs from "fs";
import * as path from "path";

module.exports = {
  name: "disable",
  execute: async (msg: any, args: any) => {
    const supportedModules = ["no-explicit"];
    const module = args[0];
    const serverId =
      msg.serverId || msg.guildId || (msg.server && msg.server.id);

    if (!supportedModules.includes(module)) {
      const server = await msg.client.servers.fetch(serverId);
      if (server.ownerId !== msg.author.id) {
        return msg.reply("❌ Only the server owner can change the prefix.");
      }
      const e = new Embed()
        .setTitle("Module not found")
        .setDescription(`The module \`${module}\` is not supported.`)
        .setColor("RED")
        .setFooter("https://guilded.gg/app")
        .setTimestamp();

      msg.reply(e);
    } else {
      let e2;

      const storagePath = path.join(__dirname, "../STORAGE/no-explicit.json");
      let data;

      if (fs.existsSync(storagePath)) {
        try {
          data = JSON.parse(fs.readFileSync(storagePath, "utf8"));
        } catch (err) {
          console.log(err);
        }
      }

      if (data.servers.includes(serverId)) {
        data.servers = data.servers.filter((id: string) => id !== serverId);
        fs.writeFileSync(storagePath, JSON.stringify(data, null, 2), "utf8");
        e2 = new Embed()
          .setTitle("Module disabled!")
          .setDescription(
            `The module \`${module}\` has been disabled. Explicit lyrics are no longer blocked.`
          )
          .setColor("ORANGE")
          .setFooter("https://guilded.gg/app")
          .setTimestamp();
      } else {
        e2 = new Embed()
          .setTitle("Module already disabled!")
          .setDescription(
            `The module \`${module}\` is already disabled. Explicit lyrics are not being blocked.`
          )
          .setColor("ORANGE")
          .setFooter("https://guilded.gg/app")
          .setTimestamp();
      }

      msg.reply(e2);
    }
  },
};
