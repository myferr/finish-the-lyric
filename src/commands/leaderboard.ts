import { Embed } from "guilded.js";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const dbPath = join(__dirname, "../STORAGE/users.json");

type EconomyData = {
  [userId: string]: {
    points: number;
    itemsOwned?: string[];
    name: string;
  };
};

// Optional cosmetics map (emoji/title to show)
const cosmeticsMap: Record<string, string> = {
  '"Music Lover" title': "Music Lover 🎵 · ",
  '"Vinyl Vibes" flair': "Vinyl Vibes 📀 · ",
};

function getAllUsersSorted() {
  if (!existsSync(dbPath)) return [];

  const raw = readFileSync(dbPath, "utf-8");
  const data: EconomyData = JSON.parse(raw);

  return Object.entries(data)
    .map(([userId, value]) => ({
      userId,
      points: value.points,
      itemsOwned: value.itemsOwned ?? [],
      name: value.name,
    }))
    .sort((a, b) => b.points - a.points);
}

module.exports = {
  name: "leaderboard",
  aliases: ["lb", "top", "ranks"],
  execute: async (msg: any, args: any) => {
    const users = getAllUsersSorted();

    if (users.length === 0) {
      return msg.reply("No users found in the leaderboard.");
    }

    const pageSize = 10;
    const totalPages = Math.ceil(users.length / pageSize);

    let page = 1;
    if (args && args.length > 0) {
      const parsed = parseInt(args[0]);
      if (!isNaN(parsed) && parsed > 0 && parsed <= totalPages) {
        page = parsed;
      }
    }

    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const pageUsers = users.slice(start, end);

    const leaderboardText = pageUsers
      .map((u, i) => {
        const cosmetics =
          u.itemsOwned
            ?.map((item) => cosmeticsMap[item])
            .filter(Boolean)
            .join(" ") || "";
        return `#${start + i + 1} ${u.name} ${cosmetics} - ${u.points} points`;
      })
      .join("\n");

    const embed = new Embed()
      .setTitle("🏆 Leaderboard")
      .setDescription(leaderboardText)
      .setColor("GREEN")
      .setFooter(`Page ${page}/${totalPages} • +help leaderboard`)
      .setTimestamp();

    msg.reply(embed);
  },
};
