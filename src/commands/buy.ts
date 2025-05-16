import { Embed } from "guilded.js";
import {
  addPoints,
  getUserPoints,
  getUserData,
  setUserData,
} from "../STORAGE/utils";

const shopData = {
  cosmetics: {
    items: [
      {
        name: '"Music Lover" title',
        description: "Appears next to your name in the leaderboard.",
        price: 150,
      },
      {
        name: '"Vinyl Vibes" flair',
        description: "Adds a retro flair/icon to your profile.",
        price: 200,
      },
    ],
  },
  boosts: {
    items: [
      {
        name: "Double Points (1 use)",
        description: "Next correct guess gives double points.",
        price: 100,
      },
      {
        name: "Skip Lyric",
        description: "Skip one lyric during a game.",
        price: 75,
      },
    ],
  },
} as const;

type ShopCategory = keyof typeof shopData;

module.exports = {
  name: "buy",
  aliases: [],
  execute: async (msg: any, args: string[]) => {
    const userId = msg.author.id;

    if (args.length < 2) {
      return msg.reply("❌ Usage: `+buy <category> <item number>`");
    }

    const categoryInput = args[0].toLowerCase();
    const itemIndex = parseInt(args[1], 10) - 1;

    if (!Object.keys(shopData).includes(categoryInput)) {
      return msg.reply(
        "❌ That category doesn't exist. Try `+shop` to see valid ones."
      );
    }

    const category = categoryInput as ShopCategory;
    const item = shopData[category].items[itemIndex];

    if (!item) {
      return msg.reply("❌ That item doesn't exist in this category.");
    }

    // Load user data
    const userData = getUserData(userId);
    const ownedItems = userData.itemsOwned || [];

    if (ownedItems.includes(item.name)) {
      return msg.reply(`❌ You already own **${item.name}**.`);
    }

    const userPoints = getUserPoints(userId);
    if (userPoints < item.price) {
      return msg.reply(
        `❌ You need ${item.price} points to buy **${item.name}**, but you only have ${userPoints}.`
      );
    }

    // Deduct points and add item
    addPoints(userId, -item.price);
    ownedItems.push(item.name);

    setUserData(userId, {
      ...userData,
      itemsOwned: ownedItems,
    });

    const embed = new Embed()
      .setTitle("✅ Purchase Complete")
      .setDescription(
        `You bought **${item.name}** for **${item.price}** points!`
      )
      .addField("New Balance", `${getUserPoints(userId)} points`, false)
      .setColor("GREEN")
      .setTimestamp();

    return msg.reply(embed);
  },
};
