// run command before putting bot offline to let people know that the bot is offline.
const { client } = require("../../");
import { getEnvConfig } from "../../utils/loadEnv";

module.exports = {
  name: "offline",
  execute: async (msg: any) => {
    const { admins } = getEnvConfig();

    console.log(msg.author.id);
    if (admins.includes(msg.author.id)) {
      await client.setStatus({
        content: `Bot is offline!`,
        emoteId: 90002269,
      });
    } else {
      msg.reply("❌ You are not an admin.");
    }
  },
};
