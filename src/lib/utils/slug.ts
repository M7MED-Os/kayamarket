/**
 * Converts a string into a URL-friendly slug.
 * Supports English and transliterates common Arabic characters to English sounds.
 */
export function generateSlug(text: string): string {
  const arabicToEnglish: { [key: string]: string } = {
    'ا': 'a', 'أ': 'a', 'إ': 'a', 'آ': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th', 'ج': 'j', 'ح': 'h', 'خ': 'kh',
    'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z', 'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z',
    'ع': 'a', 'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n', 'ه': 'h', 'و': 'w',
    'ي': 'y', 'ى': 'a', 'ة': 't', 'ئ': 'e', 'ؤ': 'o', 'لا': 'la', ' ': '-'
  };

  let slug = text.toString().toLowerCase().trim();
  
  // Transliterate Arabic to English if contains Arabic
  if (/[\u0600-\u06FF]/.test(slug)) {
    slug = slug.split('').map(char => arabicToEnglish[char] || char).join('');
  }

  return slug
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w-]+/g, '')        // Remove all non-word chars except -
    .replace(/--+/g, '-')           // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}
