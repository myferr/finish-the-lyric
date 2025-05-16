import { Embed } from "guilded.js";
import { addPoints, getUserPoints } from "../STORAGE/utils";

const { getSongWithLyrics } = require("../utils/get_lyrics");
const { client } = require("../index");

module.exports = {
  name: "guess",
  aliases: ["g", "play", "lyrics"],
  execute: async (msg: any, args: any) => {
    const argsJoined = args.join(" ");
    const guessType = argsJoined.toLowerCase();

    const lyrics = await getSongWithLyrics(true);
    if (!lyrics) return msg.reply("❌ Couldn't find any lyrics. Try again!");

    const points = Math.floor(Math.random() * 14) + 1;

    if (guessType === "lyrics") {
      // Guess missing lyrics logic
      const words: string[] = lyrics.lyrics.split(" ");
      const numToRemove = Math.random() > 0.5 ? 2 : 3;
      const cutWords = words.slice(0, words.length - numToRemove);
      const missingWords = words.slice(words.length - numToRemove).join(" ");
      const lyricPrompt = cutWords.join(" ") + " ...";

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
            addPoints(userId, points);
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
            addPoints(userId, points);
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
