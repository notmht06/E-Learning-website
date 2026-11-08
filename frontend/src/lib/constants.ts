export const SCHOLAR_NAME = "حجت الاسلام دکتر زنجیرزن حسینی";
export const SCHOLAR_NAME_AR = "حجة الإسلام الدكتور زنجير زن حسيني";
export const SCHOLAR_NAME_EN = "Hojjat al-Islam Dr. Zanjirzan Hosseini";

export function getScholarName(lang?: string): string {
  if (lang === 'en') return SCHOLAR_NAME_EN;
  if (lang === 'ar') return SCHOLAR_NAME_AR;
  return SCHOLAR_NAME;
}

export const PLATFORM_NAME = "حیات";
export const PLATFORM_NAME_EN = "Hayat";
export const PLATFORM_NAME_AR = "حياة";

