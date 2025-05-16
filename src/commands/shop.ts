import { Embed } from "guilded.js";

module.exports = {
  name: "shop",
  aliases: ["s", "store", "market"],
  execute: async (msg: any, args: any) => {
    const categories: {
      [category: string]: {
        title: string;
        description: string;
        items: {
          name: string;
          description: string;
          price: number;
        }[];
      };
    } = {
      cosmetics: {
        title: "🎨 Cosmetics Shop",
        description:
          "See something you want? Use `+buy <number>` to purchase it!",
        items: [
          {
            name: '"Music Lover" badge',
            description: "Appears next to your name in the leaderboard.",
            price: 150,
          },
          {
            name: '"Vinyl Vibes" title',
            description: "Adds a retro flair to your profile.",
            price: 200,
          },
        ],
      },
      boosts: {
        title: "⚡ Boosts Shop",
        description: "Temporary advantages. Use `+buy <number>` to claim.",
        items: [
          {
            name: "+20% DAILY BOOST (7 uses)",
            description: "Get 20% more points when using the daily command.",
            price: 100,
          },
        ],
      },
    };

    // No category provided
    if (!args[0]) {
      const embed = new Embed()
        .setTitle("🛒 Shop")
        .setDescription(
          "Shopping categories\n\n- **+shop cosmetics**\n- **+shop boosts**"
        )
        .setColor("BLUE")
        .setFooter("Use +shop <category> to view items.")
        .setTimestamp();
      return msg.reply(embed);
    }

    const category = args[0].toLowerCase();
    if (!categories[category]) {
      return msg.reply(
        "❌ That category doesn't exist. Try `+shop` to see options."
      );
    }

    // Build embed for category
    const cat = categories[category];
    const embed = new Embed()
      .setTitle(`# Shop — ${category}`)
      .setDescription(`${cat.title}\n${cat.description}`)
      .setColor("BLUE")
      .setTimestamp();

    cat.items.forEach((item, index) => {
      embed.addField(
        `${index + 1}. ${item.name} — ${item.price} pts`,
        item.description,
        false
      );
    });

    return msg.reply(embed);
  },
};
