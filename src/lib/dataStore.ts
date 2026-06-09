/**
 * Lecture/écriture des données Notion en JSON local.
 * Les fichiers sont dans /data/*.json — persistants entre les requêtes,
 * mis à jour via le bouton "Sync Notion" dans l'app.
 */
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "data");

export async function readData<T>(key: string): Promise<T | null> {
  try {
    const content = await readFile(join(DATA_DIR, `${key}.json`), "utf8");
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

export async function writeData<T>(key: string, data: T): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(join(DATA_DIR, `${key}.json`), JSON.stringify(data), "utf8");
}

export async function dataExists(key: string): Promise<boolean> {
  try {
    await readFile(join(DATA_DIR, `${key}.json`));
    return true;
  } catch {
    return false;
  }
}
