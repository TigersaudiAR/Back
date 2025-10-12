export type Hadith = {
  id: string;
  source: "KFQPC" | "Bukhari" | "Muslim" | string;
  number?: string;
  text_ar: string;
  grade?: string;
  topic?: string;
};
