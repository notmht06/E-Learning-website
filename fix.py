import os

filepath = r'e:\personal\philosophy_zanjirzan_app\frontend\src\app\courses\[id]\page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

target = r'''            {isEnrolled ? (
              <div className="p-4 rounded-lg bg-[#8A532B]/10 border border-[#8A532B]/20 text-[#8A532B] dark:text-[#C58B43] text-xs sm:text-sm font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43] shrink-0" />
                <span>{currentLang === 'en' ? 'Enrolled. All sessions are unlocked.' : currentLang === 'ar' ? 'تم التسجيل في هذه الدورة. جميع الجلسات متاحة.' : 'شما در این دوره ثبت‌نام کرده‌اید. تمامی جلسات باز است.'}</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleEnroll}
                className="w-full py-3 rounded-lg bg-[#8A532B] hover:bg-[#724424] text-white font-bold text-xs sm:text-sm shadow-xs active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{dict.course_enroll_btn || 'ثبت‌نام در دوره'}</span>
              </button>
            )}'''

replacement = r'''            {isEnrolled ? (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[#8A532B]/10 border border-[#8A532B]/20 text-[#8A532B] dark:text-[#C58B43] text-xs sm:text-sm font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#8A532B] dark:text-[#C58B43] shrink-0" />
                  <span>{currentLang === 'en' ? 'Enrolled. All sessions are unlocked.' : currentLang === 'ar' ? 'تم التسجيل في هذه الدورة. جميع الجلسات متاحة.' : 'شما در این دوره ثبت‌نام کرده‌اید. تمامی جلسات باز است.'}</span>
                </div>
                <Link
                  href={`/courses/${course.id}/learn`}
                  className="w-full py-3 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white font-bold text-xs sm:text-sm shadow-xs active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{currentLang === 'en' ? 'Enter Course Player' : currentLang === 'ar' ? 'دخول بيئة التعلم (مشغل الدورة)' : 'ورود به محیط یادگیری و پخش دوره'}</span>
                </Link>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleEnroll}
                className="w-full py-3 rounded-xl bg-[#8A532B] hover:bg-[#724320] text-white font-bold text-xs sm:text-sm shadow-xs active:scale-95 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{dict.course_enroll_btn || 'ثبت‌نام در دوره'}</span>
              </button>
            )}'''

# Also fix the text for drive link
content = content.replace("Official Audio Repositories", "Alternative Raw Audio Files (Backup)")
content = content.replace("آرشیو صوتی گوگل درایو استاد", "دانلود فایل‌های خام (نسخه پشتیبان - Google Drive)")

if target in content:
    content = content.replace(target, replacement)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Replaced successfully.')
else:
    print('Target not found. Doing a softer regex replace...')
    import re
    # Fallback if there was a minor spacing issue
    content = re.sub(r'\{isEnrolled \? \([\s\S]*?\) : \([\s\S]*?</button>\s*\)\}', replacement, content)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Regex replace attempted.')
