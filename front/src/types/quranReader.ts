/**
 * Quran Reader Types
 * Shared type definitions for Quran reader components and services
 */

export interface PageMetadata {
  page: number;
  ayahs: Array<{
    surah: number;
    ayah: number;
    bounds?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
}

export interface AyahBounds {
  surah: number;
  ayah: number;
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface LastPosition {
  page?: number;
  surah?: number;
  ayah?: number;
  timestamp: number;
}
