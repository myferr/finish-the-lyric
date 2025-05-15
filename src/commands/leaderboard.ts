import { Embed } from "guilded.js";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const dbPath = join(__dirname, "../STORAGE/economy.json");

type EconomyData = {
  [userId: string]: {
    points: number;
  };
};

function getAllUsersSorted() {
  if (!existsSync(dbPath)) return [];

  const raw = readFileSync(dbPath, "utf-8");
  const data: EconomyData = JSON.parse(raw);

  return Object.entries(data)
    .map(([userId, value]) => ({ userId, points: value.points }))
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
      .map((u, i) => `#${start + i + 1} <@${u.userId}> - ${u.points} points`)
      .join("\n");

    const embed = new Embed()
      .setTitle("Leaderboard")
      .setDescription(leaderboardText)
      .setColor("GREEN")
      .setFooter(`Page ${page}/${totalPages} • +help leaderboard`)
      .setTimestamp();

    msg.reply(embed);
  },
};
