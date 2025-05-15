import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const dbPath = join(__dirname, "economy.json");

type EconomyData = {
  [userId: string]: {
    points: number;
  };
};

function readEconomy(): EconomyData {
  if (!existsSync(dbPath)) {
    writeFileSync(dbPath, JSON.stringify({}, null, 2));
  }
  return JSON.parse(readFileSync(dbPath, "utf-8"));
}

function writeEconomy(data: EconomyData): void {
  writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export function getUserPoints(userId: string): number {
  const db = readEconomy();
  return db[userId]?.points ?? 0;
}

export function setUserPoints(userId: string, points: number): void {
  const db = readEconomy();
  db[userId] = { points };
  writeEconomy(db);
}

export function addPoints(userId: string, amount: number): void {
  const db = readEconomy();
  if (!db[userId]) db[userId] = { points: 0 };
  db[userId].points += amount;
  writeEconomy(db);
}

export function removePoints(userId: string, amount: number): void {
  const db = readEconomy();
  if (!db[userId]) db[userId] = { points: 0 };
  db[userId].points = Math.max(0, db[userId].points - amount);
  writeEconomy(db);
}

export function resetUser(userId: string): void {
  const db = readEconomy();
  delete db[userId];
  writeEconomy(db);
}
