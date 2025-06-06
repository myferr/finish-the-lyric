import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const usersPath = join(__dirname, "users.json");

function readUsers(): Record<string, any> {
  if (!existsSync(usersPath)) {
    writeFileSync(usersPath, JSON.stringify({}, null, 2));
  }
  return JSON.parse(readFileSync(usersPath, "utf-8"));
}

function writeUsers(data: Record<string, any>): void {
  writeFileSync(usersPath, JSON.stringify(data, null, 2));
}

export function getUserData(userId: string): any {
  const users = readUsers();
  return users[userId] ?? { points: 0, itemsOwned: [] };
}

export function setUserData(userId: string, newData: any): void {
  const users = readUsers();
  users[userId] = newData;
  writeUsers(users);
}

export function getUserPoints(userId: string): number {
  const data = getUserData(userId);
  return data.points || 0;
}

export function addPoints(userId: string, amount: number, name: string): void {
  const users = readUsers();
  if (!users[userId]) {
    users[userId] = { name: name, points: 0, itemsOwned: [] };
  }
  users[userId].points = (users[userId].points || 0) + amount;
  writeUsers(users);
}
