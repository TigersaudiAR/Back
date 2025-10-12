export type Dhikr = {
  id: string;
  title: string;
  text: string;
  count?: number;
  audio_url?: string;
  tags: string[];
};

export type DhikrSetName =
  | "morning"
  | "evening"
  | "after_prayer"
  | "sleep"
  | "other";

export type DhikrSet = {
  id: string;
  name: DhikrSetName;
  items: Dhikr[];
};
