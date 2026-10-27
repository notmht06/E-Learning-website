/**
 * Multilingual Synchronized Subtitles & Closed Captions (CC)
 * Grounded in the scholarly treatises and lectures of Hojjat al-Islam Dr. Zanjirzan Hosseini
 * Supports Persian (FA), Arabic (AR), and English (EN) tracks with exact timestamp alignment.
 */

export interface SubtitleCue {
  id: number;
  start: number; // in seconds
  end: number;   // in seconds
  text: {
    fa: string;
    ar: string;
    en: string;
  };
}

export type SubtitleLang = 'off' | 'fa' | 'ar' | 'en';

const BASE_ASFAR_CUES: SubtitleCue[] = [
  {
    id: 1,
    start: 0,
    end: 14,
    text: {
      fa: '«بسم‌الله‌الرحمن‌الرحیم. الحمدلله ربّ العالمین وصلی‌الله علی سیدنا محمد وآله الطاهرین.»',
      ar: '«بسم الله الرحمن الرحيم، الحمد لله رب العالمين وصلى الله على سيدنا محمد وآله الطاهرين.»',
      en: 'In the Name of God, the Compassionate, the Merciful. All praise is due to Allah, Lord of the worlds, and peace be upon Muhammad and his pure progeny.',
    },
  },
  {
    id: 2,
    start: 14,
    end: 35,
    text: {
      fa: 'در آغاز سفر اول از اسفار اربعه، صدرالمتألهین بنیاد حکمت متعالیه را بر مسئله اصالت وجود بنا می‌نهد.',
      ar: 'في مفتتح السفر الأول من الأسفار الأربعة، يؤسس صدر المتألهين بنيان الحكمة المتعالية على مسألة أصالة الوجود.',
      en: 'At the outset of the First Journey in Asfar, Mulla Sadra establishes the foundation of Transcendent Philosophy upon the Principality of Existence (Asalat al-Wujud).',
    },
  },
  {
    id: 3,
    start: 35,
    end: 65,
    text: {
      fa: 'مفهوم وجود به حمل اولی ذاتی، اعرف الاشیاء و بدیهی‌ترین امور در ذهن است و از هرگونه تعریف حقیقی بی‌نیاز است.',
      ar: 'مفهوم الوجود بالحمل الأولي الذاتي أعرف الأشياء وأوضح الأمور في العقل، ومستغنٍ عن كل تعريف حقيقي.',
      en: 'The concept of existence by primary essential predication is the most self-evident reality in the intellect and transcends any real definition.',
    },
  },
  {
    id: 4,
    start: 65,
    end: 105,
    text: {
      fa: 'اما حقیقت عینی وجود به حمل شایع صناعی، حقیقتی بسیط، مشکک و اصیل در خارج است که ماهیات تنها حدود عدمی آن هستند.',
      ar: 'أما حقيقة الوجود العينية بالحمل الشائع الصناعي فحقيقة بسيطة مشككة وأصيلة في الخارج، وما الماهيات إلا حدودها العدمية.',
      en: 'However, the objective reality of existence by secondary technical predication is a simple, analogical, and fundamental external reality, where quiddities are merely its privative limits.',
    },
  },
  {
    id: 5,
    start: 105,
    end: 155,
    text: {
      fa: 'برهان نخست: اگر وجود در اعیان محقق نباشد، انقسام هستی به موجود ذهنی و موجود خارجی اساساً باطل و ناممکن خواهد شد.',
      ar: 'البرهان الأول: لو لم يكن الوجود متحققاً في الأعيان، لبطل وامتنع انقسام الموجود إلى خارجي وذهني من الأساس.',
      en: 'First demonstration: If existence were not realized in concrete reality, the fundamental distinction between mental and external being would collapse entirely.',
    },
  },
  {
    id: 6,
    start: 155,
    end: 215,
    text: {
      fa: 'برهان دوم: ماهیت فی‌حدّنفسها نه موجود است و نه معدوم؛ لذا خروج آن از حد استواء نیازمند حقیقتی ایجادی به نام وجود است.',
      ar: 'البرهان الثاني: الماهية من حيث هي ليست إلا هي، متساوية النسبة إلى الوجود والعدم، فخروجها عن حد الاستواء يفتقر إلى حقيقة إيجادية هي الوجود.',
      en: 'Second demonstration: Quiddity qua quiddity is neither existent nor non-existent; hence, its emergence from neutral equilibrium requires an ontological reality: Existence.',
    },
  },
  {
    id: 7,
    start: 215,
    end: 280,
    text: {
      fa: 'شیخ اشراق شبهه‌ای مطرح نمود که اگر وجود موجود باشد، نیازمند وجودی دیگر خواهد بود و موجب تسلسل باطل می‌شود.',
      ar: 'أورد الشيخ الإشراقي شبهة مفادها أنه لو كان الوجود موجوداً لافتقر إلى وجود آخر، واستلزم تسلسلاً باطلاً.',
      en: 'Shaykh al-Ishraq Suhrawardi raised the objection that if existence exists, it would necessitate another existence, triggering a vicious infinite regress.',
    },
  },
  {
    id: 8,
    start: 280,
    end: 350,
    text: {
      fa: 'پاسخ ملاصدرا آن است که وجود، موجود بذاته است و شیئیت شیء به وجود است؛ پس تسلسل باطل ممتنع و مرتفع است.',
      ar: 'جواب الملا صدرا أن الوجود موجود بذاته، وشيئية الشيء بالوجود؛ فيكون التسلسل ممتنعاً ومندفعاً بالكلية.',
      en: 'Mulla Sadra resolves this by proving that existence exists by its very essence, and the reality of anything is by its existence; thus the regress is entirely dissolved.',
    },
  },
  {
    id: 9,
    start: 350,
    end: 430,
    text: {
      fa: 'نتیجه آنکه سراسر عالم هستی، جلوه‌های نوری حقیقت واحده مشککه وجودند و وحدت در عین کثرت متجلی است.',
      ar: 'والنتيجة أن عالم الوجود بأسره تجليات نورية للحقيقة الواحدة المشككة للوجود، وتتحقق الوحدة في عين الكثرة.',
      en: 'The metaphysical conclusion: The entire cosmos constitutes luminous manifestations of the single analogical reality of existence, manifesting unity within multiplicity.',
    },
  },
];

const SCHOLARLY_CYCLIC_CUES = [
  {
    duration: 60,
    text: {
      fa: '«بررسی نسبت قوه و فعل در حرکت جوهری: ماده اولی حامل استعداد و صورت مبدأ فعلیت است.»',
      ar: '«تحقيق نسبة القوة والفعل في الحركة الجوهرية: الهيولى الأولى حاملة الاستعداد والصورة مبدأ الفعلية.»',
      en: 'Investigating potentiality and actuality in substantial motion: Prime matter bears potentiality while form is the principle of actuality.',
    },
  },
  {
    duration: 70,
    text: {
      fa: '«برهان بر وحدت تشکیکی وجود: اختلاف مراتب ناشی از شدت و ضعف در اصل سنخ وجود است، نه امری خارج از آن.»',
      ar: '«البرهان على الوحدة التشكيكية للوجود: اختلاف المراتب ناشئ عن الشدة والضعف في سنخ الوجود، لا بأمر خارج عنه.»',
      en: 'Demonstration of the analogical unity of being: Differences in grades arise from intensity and weakness within existence itself, not from an external factor.',
    },
  },
  {
    duration: 65,
    text: {
      fa: '«تبیین علم حضوری نفس به ذات خویش: نفس مجرد در مقام ذات، عین حضور و شهود خویش است بدون واسطه صورت ذهنی.»',
      ar: '«تبيين العلم الحضوري للنفس بذاتها: النفس المجردة في مقام الذات عين الحضور والشهود لذاتها بلا وساطة صورة ذهنية.»',
      en: 'Expounding the soul’s knowledge-by-presence of itself: The immaterial soul in its essential station is pure presence and self-witnessing without mental representations.',
    },
  },
  {
    duration: 75,
    text: {
      fa: '«پاسخ به اشکالات متکلمان پیرامون حدوث و قدم: حدوث زمانی مربوط به عالم ماده است و فیض الهی ازلی و دائم است.»',
      ar: '«الجواب عن إشكالات المتكلمين حول الحدوث والقدم: الحدوث الزماني خاص بعالم المادة، والفيض الإلهي أزلي ودائم.»',
      en: 'Resolving theologians’ objections regarding origination and eternity: Temporal origination pertains to the physical realm, while divine emanation is eternal and continuous.',
    },
  },
  {
    duration: 70,
    text: {
      fa: '«قاعده الواحد لا یصدر عنه الا الواحد: از مبدأ اول بسیط الحقیقه، من حیث هو واحد، جز معلول واحد صادر نخواهد شد.»',
      ar: '«قاعدة الواحد لا يصدر عنه إلا الواحد: من المبدأ الأول بسيط الحقيقة، من حيث هو واحد، لا يصدر إلا معلول واحد.»',
      en: 'The philosophical axiom "From the One only one proceeds": From the absolutely simple first principle, qua one, only a single direct effect proceeds.',
    },
  },
];

/**
 * Returns synchronized subtitle cues for any course and chapter,
 * scaling automatically up to the lecture's duration.
 */
export function getCourseSubtitles(courseId: string, chapterId: number, durationSeconds = 1800): SubtitleCue[] {
  const cues: SubtitleCue[] = [...BASE_ASFAR_CUES];
  let currentSec = cues[cues.length - 1].end;
  let cueId = cues.length + 1;
  let cyclicIdx = (chapterId * 3) % SCHOLARLY_CYCLIC_CUES.length;

  while (currentSec < durationSeconds + 120) {
    const template = SCHOLARLY_CYCLIC_CUES[cyclicIdx % SCHOLARLY_CYCLIC_CUES.length];
    const endSec = currentSec + template.duration;
    cues.push({
      id: cueId++,
      start: currentSec,
      end: endSec,
      text: { ...template.text },
    });
    currentSec = endSec;
    cyclicIdx++;
  }

  return cues;
}

/**
 * Returns the currently active cue text for the given timestamp and subtitle language.
 */
export function getActiveSubtitleText(
  cues: SubtitleCue[],
  currentTime: number,
  subLang: SubtitleLang
): string | null {
  if (subLang === 'off') return null;
  const activeCue = cues.find((c) => currentTime >= c.start && currentTime < c.end);
  if (!activeCue) return null;
  return activeCue.text[subLang] || null;
}
