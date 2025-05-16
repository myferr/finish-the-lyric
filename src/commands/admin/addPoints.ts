import { addPoints } from "../../STORAGE/utils";
import { getEnvConfig } from "../../utils/loadEnv";

module.exports = {
  name: "addpoints",
  execute: async (msg: any, args: string[]) => {
    const { admins } = getEnvConfig();
    const argsJoined: string = args.join(" ");
    const pointsToAdd: number = +argsJoined;

    if (!admins.includes(msg.author.id)) {
      return msg.reply("❌ You are not an admin.");
    }

    addPoints(msg.author.id, pointsToAdd);
    const reply = await msg.reply(
      `✅ Added ${pointsToAdd} points to your account.`
    );

    // Delete both messages after 1 second
    setTimeout(async () => {
      try {
        await msg.delete();
        await reply.delete();
      } catch (err) {
        console.error("Failed to delete messages:", err);
      }
    }, 200);
  },
};
