import { env } from "../index";
const axios = require("axios");

const GENIUS_API_TOKEN = env.genius_access_token;

const getRandomSeed = () => {
  const hipHopSeeds = [
    "flex",
    "grind",
    "money",
    "drip",
    "trap",
    "hustle",
    "real",
    "bars",
    "beef",
    "opps",
    "thug",
    "ride",
    "crew",
    "chain",
    "street",
    "freestyle",
  ];

  const popSeeds = [
    "love",
    "heart",
    "tonight",
    "dream",
    "dance",
    "stars",
    "magic",
    "baby",
    "kiss",
    "feel",
    "summer",
    "forever",
    "light",
    "run",
    "alive",
  ];

  const rnbSeeds = [
    "slow",
    "vibe",
    "touch",
    "feel",
    "passion",
    "night",
    "soul",
    "cry",
    "heartbreak",
    "emotion",
    "midnight",
    "groove",
    "honey",
  ];

  const seeds = [...hipHopSeeds, ...popSeeds, ...rnbSeeds];
  return seeds[Math.floor(Math.random() * seeds.length)];
};

async function getRandomSongFromGenius(): Promise<{
  artist: string;
  song: string;
} | null> {
  const seed = getRandomSeed();

  try {
    const response = await axios.get("https://api.genius.com/search", {
      headers: { Authorization: `Bearer ${GENIUS_API_TOKEN}` },
      params: { q: seed },
    });

    const hits = response.data.response.hits;
    if (hits.length === 0) return null;

    const result = hits[Math.floor(Math.random() * hits.length)].result;
    return {
      artist: result.primary_artist.name,
      song: result.title,
    };
  } catch (error) {
    console.error("Error fetching from Genius:", error);
    return null;
  }
}

async function getLyrics(artist: string, song: string): Promise<string | null> {
  try {
    const response = await axios.get(
      `https://api.lyrics.ovh/v1/${encodeURIComponent(
        artist
      )}/${encodeURIComponent(song)}`
    );
    return response.data.lyrics;
  } catch {
    return null;
  }
}

async function getSongWithLyrics(random?: boolean) {
  const maxRetries = 5;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const result = await getRandomSongFromGenius();
    if (!result) {
      console.warn(`⚠️ Attempt ${attempt + 1}: No song found, retrying...`);
      continue;
    }

    const lyrics = await getLyrics(result.artist, result.song);
    if (!lyrics || lyrics.split(/\s+/).filter(Boolean).length < 3) {
      console.warn(
        `⚠️ Attempt ${attempt + 1}: Lyrics too short or not found for ${
          result.artist
        } - ${result.song}, retrying...`
      );
      continue;
    }

    // If random is true, pick a random line from the lyrics
    let outputLyrics = lyrics;
    if (random) {
      const lines = lyrics
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      outputLyrics = lines[Math.floor(Math.random() * lines.length)] || "";
    }

    return {
      artist: result.artist,
      song: result.song,
      lyrics: outputLyrics,
    };
  }

  console.error(
    "❌ Failed to fetch valid song and lyrics after several attempts."
  );
  return null;
}

module.exports = {
  getSongWithLyrics,
};
