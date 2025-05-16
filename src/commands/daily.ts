import { addPoints, getUserPoints } from "../STORAGE/utils";
import { Embed } from "guilded.js";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const cooldownPath = join(__dirname, "../STORAGE/dailyCooldowns.json");

function readCooldowns(): Record<string, number> {
  if (!existsSync(cooldownPath)) {
    writeFileSync(cooldownPath, JSON.stringify({}, null, 2));
  }

  const raw = JSON.parse(readFileSync(cooldownPath, "utf-8"));

  for (const key in raw) {
    if (raw[key] > 1e12) {
      raw[key] = Math.floor(raw[key] / 1000);
    }
  }

  return raw;
}

function writeCooldowns(data: Record<string, number>): void {
  writeFileSync(cooldownPath, JSON.stringify(data, null, 2));
}

const DAILY_POINTS = Math.floor(Math.random() * (30 - 10 + 1)) + 10; // 10 to 30
const COOLDOWN_SECONDS = 24 * 60 * 60; // 24 hours in seconds

module.exports = {
  name: "daily",
  aliases: ["claim"],
  execute: async (msg: any) => {
    const userId = msg.author.id;
    const cooldowns = readCooldowns();
    const now = Math.floor(Date.now() / 1000); // seconds

    const lastClaim = cooldowns[userId] ?? 0;
    const elapsed = now - lastClaim;

    if (elapsed < COOLDOWN_SECONDS) {
      const remaining = COOLDOWN_SECONDS - elapsed;
      const hours = Math.floor(remaining / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = remaining % 60;

      return msg.reply(
        `⏳ You've already claimed your daily reward. Try again in **${hours}h ${minutes}m ${seconds}s**.`
      );
    }

    // Grant points
    addPoints(userId, DAILY_POINTS);
    cooldowns[userId] = now;
    writeCooldowns(cooldowns);

    const totalPoints = getUserPoints(userId);

    const embed = new Embed()
      .setTitle("🎁 Daily Reward")
      .setDescription(
        `You received **+${DAILY_POINTS}** points!\nYou now have **${totalPoints}** points.`
      )
      .setColor("GOLD")
      .setTimestamp();

    msg.reply(embed);
  },
};
