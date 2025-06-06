import { addPoints, getUserData, setUserData } from "../STORAGE/utils";
import { Embed } from "guilded.js";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const cooldownPath = join(__dirname, "../STORAGE/dailyCooldowns.json");
const DAILY_MIN = 10;
const DAILY_MAX = 30;
const BOOST_NAME = "20% DAILY BOOST";
const MAX_BOOST_USES = 7;

function readCooldowns(): Record<string, number> {
  if (!existsSync(cooldownPath)) {
    writeFileSync(cooldownPath, JSON.stringify({}, null, 2));
  }
  return JSON.parse(readFileSync(cooldownPath, "utf-8"));
}

function writeCooldowns(data: Record<string, number>): void {
  writeFileSync(cooldownPath, JSON.stringify(data, null, 2));
}

function getRandomPoints(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
  name: "daily",
  aliases: ["claim"],
  execute: async (msg: any) => {
    const userId = msg.author.id;
    const cooldowns = readCooldowns();
    const now = Math.floor(Date.now() / 1000); // seconds
    const lastClaim = cooldowns[userId] ?? 0;
    const elapsed = now - lastClaim;

    const COOLDOWN_SECONDS = 24 * 60 * 60;
    if (elapsed < COOLDOWN_SECONDS) {
      const remaining = COOLDOWN_SECONDS - elapsed;
      const hours = Math.floor(remaining / 3600);
      const minutes = Math.floor((remaining % 3600) / 60);
      const seconds = remaining % 60;

      return msg.reply(
        `⏳ You've already claimed your daily reward. Try again in **${hours}h ${minutes}m ${seconds}s**.`
      );
    }

    const user = getUserData(userId);
    let points = getRandomPoints(DAILY_MIN, DAILY_MAX);

    if (user.itemsOwned?.includes(BOOST_NAME)) {
      points = Math.floor(points * 1.2);

      // Use internal counter logic via a boost tag
      if (!user._boostUses) user._boostUses = {};
      user._boostUses[BOOST_NAME] = (user._boostUses[BOOST_NAME] || 0) + 1;

      if (user._boostUses[BOOST_NAME] >= MAX_BOOST_USES) {
        // Remove boost
        user.itemsOwned = user.itemsOwned.filter(
          (item: any) => item !== BOOST_NAME
        );
        delete user._boostUses[BOOST_NAME];
        msg.reply("⚠️ Your **20% DAILY BOOST** has expired.");
      }
    }

    // Add points and update user data
    user.points = user.points || 0;
    setUserData(userId, user);
    addPoints(userId, points, msg.author.name);
    console.log("Added points: " + points);
    cooldowns[userId] = now;
    writeCooldowns(cooldowns);

    const embed = new Embed()
      .setTitle("🎁 Daily Reward")
      .setDescription(`You received **+${points}** points!`)
      .setColor("GOLD")
      .setTimestamp();

    msg.reply(embed);
  },
};
