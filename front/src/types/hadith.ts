export type Hadith = {
  id: string;
  title?: string;
  narrator?: string;
  source: "KFQPC" | "Bukhari" | "Muslim" | string;
  number?: string;
  text_ar: string;
  grade?: string;
  topic?: string | string[];
};
