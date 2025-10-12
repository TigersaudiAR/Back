import fs from "fs";
import path from "path";

export function loadJson<T>(fileName: string): T {
  const filePath = path.join(process.cwd(), "data", "seed", fileName);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}
