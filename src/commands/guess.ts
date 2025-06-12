import { Embed } from "guilded.js";
import { addPoints, getUserPoints } from "../STORAGE/utils";
import { safespeak } from "safespeak";
const NoExplicitServers = require("../STORAGE/no-explicit.json");
const { getSongWithLyrics } = require("../utils/get_lyrics");
const { client } = require("../index");

module.exports = {
  name: "guess",
  aliases: ["g", "play", "lyrics"],
  execute: async (msg: any, args: any) => {
    const serverId =
      msg.serverId || msg.guildId || (msg.server && msg.server.id);
    const argsJoined = args.join(" ");
    const guessType = argsJoined.toLowerCase();
    const ServersWithNoExplicit = NoExplicitServers.servers;
    const isServerClean = ServersWithNoExplicit.includes(serverId);
    const THRESHOLD = 0.6;

    if (isServerClean) {
      console.log(`Server ${serverId} has explicit lyrics blocked!`);
    }

    async function fetchCleanLyrics(): Promise<any> {
      let lyrics;
      let attempts = 0;
      do {
        lyrics = await getSongWithLyrics(true);
        attempts++;
        if (!lyrics) break;
      } while (
        (await safespeak.isProfane(lyrics.lyrics, THRESHOLD)) &&
        attempts < 5
      );
      return lyrics;
    }

    let lyrics = await fetchCleanLyrics();
    if (!lyrics) return msg.reply("❌ Couldn't find any lyrics. Try again!");

    const points = Math.floor(Math.random() * 14) + 1;

    if (guessType === "lyrics") {
      // Guess missing lyrics logic
      const words: string[] = lyrics.lyrics.split(" ");
      const numToRemove = Math.random() > 0.5 ? 2 : 3;
      const cutWords = words.slice(0, words.length - numToRemove);
      const missingWords = words.slice(words.length - numToRemove).join(" ");
      const lyricPrompt = cutWords.join(" ") + " ...";

      if (isServerClean) {
        if (
          (await safespeak.isProfane(cutWords.join(" "), THRESHOLD)) ||
          (await safespeak.isProfane(missingWords, THRESHOLD)) ||
          ((await safespeak.isProfane(cutWords.join(" "), THRESHOLD)) &&
            (await safespeak.isProfane(missingWords, THRESHOLD)))
        ) {
          console.log("Refetching due to profanity.");
          fetchCleanLyrics();
        }
      }

      const embed = new Embed()
        .setTitle("🎵 Finish the lyric:")
        .setDescription(`Finish these lyrics to win ${points} points!`)
        .setColor("GREEN")
        .setFooter("+help <command> for more information about a command")
        .setTimestamp()
        .addFields([
          { name: "**Lyrics**", value: lyricPrompt, inline: true },
          {
            name: "**Hint**",
            value: `The artist is **${lyrics.artist}**`,
            inline: true,
          },
        ]);

      await msg.reply(embed);

      const filter = (m: any) =>
        m.channelId === msg.channelId && m.createdById === msg.createdById;

      const listener = (m: any) => {
        if (filter(m)) {
          const guess = m.content.trim().toLowerCase();
          const answer = missingWords.trim().toLowerCase();

          if (guess.includes(answer)) {
            const userId = msg.createdById;
            addPoints(userId, points, msg.author.name);
            const userPoints = getUserPoints(userId);

            msg.reply(
              `✅ Correct! You earned ${points} points. Your total: ${userPoints}`
            );
          } else {
            msg.reply(
              `❌ Incorrect. The missing words were: "${missingWords}".`
            );
          }

          client.off("messageCreated", listener);
        }
      };

      client.on("messageCreated", listener);
    } else if (guessType === "song") {
      if (isServerClean) {
        if (await safespeak.isProfane(lyrics.lyrics, THRESHOLD)) {
          console.log("Refetching due to profanity.");
          fetchCleanLyrics();
        }
      }

      // Guess song name logic
      const embed = new Embed()
        .setTitle("🎵 Guess the song name:")
        .setDescription(`Guess the song name to win ${points} points!`)
        .setColor("BLUE")
        .setFooter("+help <command> for more information about a command")
        .setTimestamp()
        .addFields([
          {
            name: "**Lyrics snippet**",
            value: lyrics.lyrics,
            inline: true,
          },
          {
            name: "**Hint**",
            value: `The artist is **${lyrics.artist}**`,
            inline: true,
          },
        ]);

      await msg.reply(embed);

      const filter = (m: any) =>
        m.channelId === msg.channelId && m.createdById === msg.createdById;

      const listener = (m: any) => {
        if (filter(m)) {
          const guess = m.content.trim().toLowerCase();
          const answer = lyrics.song.trim().toLowerCase();

          if (guess === answer) {
            const userId = msg.createdById;
            addPoints(userId, points, msg.author.name);
            const userPoints = getUserPoints(userId);

            msg.reply(
              `✅ Correct! You earned ${points} points. Your total: ${userPoints}`
            );
          } else {
            msg.reply(`❌ Incorrect. The song was: "${lyrics.song}".`);
          }

          client.off("messageCreated", listener);
        }
      };

      client.on("messageCreated", listener);
    } else {
      const embed = new Embed()
        .setTitle("Guess")
        .setDescription(
          "There's a small problem 😅\nYou have to provide a proper argument.\n\n- `+guess lyrics` to guess song lyrics\n- `+guess song` to guess song names"
        )
        .setColor("GREEN")
        .setFooter("+help <command> for more information about a command")
        .setTimestamp();

      await msg.reply(embed);
    }
  },
};
