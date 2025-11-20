export type Surah = {
  id: number;
  name_ar: string;
  name_en?: string;
  revelation_place?: "Mecca" | "Medina";
  ayah_count: number;
  bismillah_pre?: boolean;
  slug?: string;
};

export type Ayah = {
  surah_id: number;
  ayah_number: number;
  text_ar: string;
  page?: number;
  juz?: number;
  hizb?: number;
};

export type AyahTranslation = {
  surah_id: number;
  ayah_number: number;
  text: string;
  source?: string;
};

export type Tafsir = {
  surah_id: number;
  ayah_number: number;
  source: string;
  text_ar: string;
};

export type AyahTiming = {
  ayah_number: number;
  start: number;
  end: number;
};

export type Recitation = {
  surah_id: number;
  url: string;
  reciter: string;
  bitrate?: number;
  reciter_id: string;
  timings?: AyahTiming[];
};

export interface AyahBoundingBox {
  ayahId: string | number;
  surahNumber: number;
  ayahNumber: number;
  x: number; // percentage or pixels
  y: number;
  width: number;
  height: number;
}

export interface QuranPage {
  page_number: number;
  ayat: Ayah[];
  verses?: Ayah[];
  // Add other fields as per actual API response
}
