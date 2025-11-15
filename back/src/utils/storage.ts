import fs from "fs";
import path from "path";

const STORAGE_DIR = path.join(process.cwd(), "data", "storage");

function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

export function readStoredJson<T>(fileName: string): T | null {
  try {
    const filePath = path.join(STORAGE_DIR, fileName);
    if (!fs.existsSync(filePath)) {
      return null;
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (error) {
    console.error(`Failed to read stored json ${fileName}`, error);
    return null;
  }
}

export function writeStoredJson<T>(fileName: string, data: T): void {
  ensureStorageDir();
  const filePath = path.join(STORAGE_DIR, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
}
