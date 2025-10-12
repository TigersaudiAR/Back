export type Surah = {
  id: number;
  name_ar: string;
  name_en?: string;
  revelation_place?: "Mecca" | "Medina";
  ayah_count: number;
  bismillah_pre?: boolean;
};

export type Ayah = {
  surah_id: number;
  ayah_number: number;
  text_ar: string;
  page?: number;
  juz?: number;
  hizb?: number;
};

export type Tafsir = {
  surah_id: number;
  ayah_number: number;
  source: string;
  text_ar: string;
};

export type Recitation = {
  surah_id: number;
  url: string;
  reciter: string;
  bitrate?: number;
};
