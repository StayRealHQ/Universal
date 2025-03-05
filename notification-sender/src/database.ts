import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from "node:path"

// const db = new sqlite3.Database(path.join(import.meta.dirname, "..", 'database.db'));
const db = await open({
  filename: path.join(import.meta.dirname, "..", 'database.db'),
  driver: sqlite3.Database
});

await db.exec(`CREATE TABLE IF NOT EXISTS moments (
  region VARCHAR(12) PRIMARY KEY NOT NULL,
  last_id VARCHAR(100) NOT NULL
)`);

await db.exec(`CREATE TABLE IF NOT EXISTS ios_devices (
  id VARCHAR(36) PRIMARY KEY NOT NULL,
  debug BOOLEAN NOT NULL,
  token VARCHAR(200) NOT NULL,
  region VARCHAR(12) NOT NULL,
  FOREIGN KEY(region) REFERENCES moments(region)
)`);

export const getLastMomentForRegion = async (region: string): Promise<string | undefined> => {
  const row = await db.get<{ last_id: string }>(
    `SELECT last_id FROM moments WHERE region = ?`,
    [region]
  );

  return row?.last_id;
}

export const setLastMomentForRegion = async (region: string, lastId: string): Promise<void> => {
  await db.run(
    `INSERT OR REPLACE INTO moments (region, last_id) VALUES (?, ?)`,
    [region, lastId]
  );
}

export const setIOSDevice = async (id: string, debug: boolean, token: string, region: string): Promise<void> => {
  await db.run(
    `INSERT OR REPLACE INTO ios_devices (id, debug, token, region) VALUES (?, ?, ?, ?)`,
    [id, debug, token, region]
  );
}

export const getIOSDevicesForRegion = async (region: string): Promise<Array<{ id: string, debug: boolean, token: string }>> => {
  const rows = await db.all<Array<{ id: string, debug: boolean, token: string }>>(
    `SELECT id, debug, token FROM ios_devices WHERE region = ?`,
    [region]
  );

  return rows;
}

export const clearIOSDevice = async (id: string): Promise<void> => {
  await db.run(
    `DELETE FROM ios_devices WHERE id = ?`,
    [id]
  );
}
