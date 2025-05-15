const { client } = require("../../");
import { getEnvConfig } from "../../utils/loadEnv";

module.exports = {
  name: "eval",
  execute: async (msg: any, args: any) => {
    const code = args.join(" ");
    const { admins } = getEnvConfig();

    if (!admins.includes(msg.author.id)) {
      return msg.reply("❌ You are not an admin.");
    }

    try {
      const asyncEval = new Function(
        "client",
        "msg",
        `return (async () => { ${code} })();`
      );
      const result = await asyncEval(client, msg);

      if (result !== undefined) {
        msg.reply(
          `✅ Result: ${
            typeof result === "string" ? result : JSON.stringify(result)
          }`
        );
      } else {
        msg.reply("✅ Evaluated successfully.");
      }
    } catch (error: any) {
      console.error("Eval error:", error);
      msg.reply(`❌ Error: ${error.message}`);
    }
  },
};
