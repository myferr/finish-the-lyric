import { Embed } from "guilded.js";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const dbPath = join(__dirname, "../STORAGE/users.json");

type EconomyData = {
  [userId: string]: {
    points: number;
    itemsOwned?: string[];
  };
};

module.exports = {
  name: "inventory",
  aliases: ["inv", "bag", "items"],
  execute: async (msg: any) => {
    const userId = msg.author.id;

    if (!existsSync(dbPath)) {
      return msg.reply("❌ No data found.");
    }

    const raw = readFileSync(dbPath, "utf-8");
    const data: EconomyData = JSON.parse(raw);

    const userData = data[userId];
    if (!userData || !userData.itemsOwned || userData.itemsOwned.length === 0) {
      return msg.reply(
        "🎒 You don't own any items yet. Use `+shop` to buy some!"
      );
    }

    const itemList = userData.itemsOwned
      .map((item, i) => `**${i + 1}.** ${item}`)
      .join("\n");

    const embed = new Embed()
      .setTitle("🎒 Your Inventory")
      .setDescription(itemList)
      .setColor("PURPLE")
      .setFooter("Use +shop to explore more items!")
      .setTimestamp();

    msg.reply(embed);
  },
};
