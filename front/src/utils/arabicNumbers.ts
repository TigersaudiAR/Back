/**
 * Convert Western (Arabic) numerals to Eastern Arabic-Indic numerals
 * Used for displaying verse numbers in a traditional Quranic style
 */
export const toArabicIndic = (num: number | string): string => {
  const arabicNumerals: Record<string, string> = {
    '0': '٠',
    '1': '١',
    '2': '٢',
    '3': '٣',
    '4': '٤',
    '5': '٥',
    '6': '٦',
    '7': '٧',
    '8': '٨',
    '9': '٩'
  };
  
  return String(num).replace(/[0-9]/g, (digit) => arabicNumerals[digit] || digit);
};

/**
 * Format verse number with decorative circle
 * Returns the number in Arabic-Indic numerals
 */
export const formatVerseNumber = (num: number): string => {
  return toArabicIndic(num);
};
