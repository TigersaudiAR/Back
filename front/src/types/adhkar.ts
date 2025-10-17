export type Dhikr = {
  id: string;
  title: string;
  text: string;
  count?: number;
  audio_url?: string;
  tags: string[];
  reference?: string;
};

export type DhikrSet = {
  id: string;
  name: string;
  title?: string;
  description?: string;
  items: Dhikr[];
};
