import { SupportedLang, toLocaleDigits, initialCategories } from './data';

/**
 * Universal localized field getter for any entity with _fa, _ar, _en suffixes.
 */
export function getLocalized<T extends Record<string, any>>(
  item: T | null | undefined,
  field: string,
  lang: SupportedLang,
  fallbackLang: SupportedLang = 'fa'
): string {
  if (!item) return '';
  const val = item[`${field}_${lang}`];
  if (val !== undefined && val !== null && val !== '') {
    return String(val);
  }
  const fallbackVal = item[`${field}_${fallbackLang}`];
  if (fallbackVal !== undefined && fallbackVal !== null && fallbackVal !== '') {
    return String(fallbackVal);
  }
  const standardVal = item[field];
  if (standardVal !== undefined && standardVal !== null && standardVal !== '') {
    return String(standardVal);
  }
  return '';
}

/**
 * Convert numbers to localized digits based on the current language.
 * Persian and Arabic use Eastern Arabic numerals; English uses standard Western numerals.
 */
export function formatLocalizedNumber(num: number | string, lang: SupportedLang): string {
  return toLocaleDigits(num, lang);
}

/**
 * Translates subject based on initialCategories definition.
 */
export function getLocalizedSubject(subject: string, lang: SupportedLang): string {
  if (!subject) return '';
  const match = initialCategories.find(
    (c) => c.name === subject || c.name_fa === subject || c.slug === subject || c.id === subject
  );
  if (match) {
    if (lang === 'en' && match.name_en) return match.name_en;
    if (lang === 'ar' && match.name_ar) return match.name_ar;
    return match.name_fa || match.name;
  }
  const subjectMap: Record<string, { en: string; ar: string }> = {
    'منطق': { en: 'Logic', ar: 'المنطق' },
    'فلسفه': { en: 'Philosophy', ar: 'الفلسفة' },
    'فلسفه اسلامی': { en: 'Islamic Philosophy', ar: 'الفلسفة الإسلامية' },
    'کلام': { en: 'Theology', ar: 'علم الكلام' },
    'فقه': { en: 'Jurisprudence', ar: 'الفقه' },
    'اصول': { en: 'Legal Theory', ar: 'أصول الفقه' },
    'اصول فقه': { en: 'Legal Theory', ar: 'أصول الفقه' },
    'تفسیر': { en: 'Quranic Exegesis', ar: 'التفسير' },
    'عرفان': { en: 'Mysticism', ar: 'العرفان' },
    'عرفان نظری': { en: 'Theoretical Mysticism', ar: 'العرفان النظري' },
    'حکمت متعالیه': { en: 'Transcendent Philosophy', ar: 'الحكمة المتعالية' },
    'فلسفه اشراق': { en: 'Illuminationist Philosophy', ar: 'حكمة الإشراق' },
  };
  if (subjectMap[subject]) {
    return lang === 'en' ? subjectMap[subject].en : lang === 'ar' ? subjectMap[subject].ar : subject;
  }
  return subject;
}

/**
 * Translates recurring schedules into English or Arabic.
 */
export function getLocalizedSchedule(schedule: string, lang: SupportedLang): string {
  if (!schedule || lang === 'fa') return schedule || '';
  if (lang === 'en') {
    return schedule
      .replace(/شنبه‌ها و دوشنبه‌ها/g, 'Saturdays & Mondays')
      .replace(/دوشنبه‌ها/g, 'Mondays')
      .replace(/سه‌شنبه‌ها/g, 'Tuesdays')
      .replace(/چهارشنبه‌ها/g, 'Wednesdays')
      .replace(/پنجشنبه‌ها/g, 'Thursdays')
      .replace(/جمعه‌ها/g, 'Fridays')
      .replace(/یکشنبه‌ها/g, 'Sundays')
      .replace(/شنبه/g, 'Saturday')
      .replace(/ساعت/g, 'at')
      .replace(/الی/g, '-')
      .replace(/تا/g, '-')
      .replace(/[۰-۹]/g, (d) => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]);
  }
  if (lang === 'ar') {
    return schedule
      .replace(/شنبه‌ها و دوشنبه‌ها/g, 'السبت والإثنين')
      .replace(/دوشنبه‌ها/g, 'أيام الإثنين')
      .replace(/سه‌شنبه‌ها/g, 'أيام الثلاثاء')
      .replace(/چهارشنبه‌ها/g, 'أيام الأربعاء')
      .replace(/پنجشنبه‌ها/g, 'أيام الخميس')
      .replace(/جمعه‌ها/g, 'أيام الجمعة')
      .replace(/یکشنبه‌ها/g, 'أيام الأحد')
      .replace(/شنبه/g, 'السبت')
      .replace(/ساعت/g, 'الساعة')
      .replace(/الی/g, 'إلى')
      .replace(/تا/g, 'إلى')
      .replace(/[۰-۹]/g, (d) => '٠١٢٣٤٥٦٧٨٩'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]);
  }
  return schedule;
}

/**
 * Translates chapter titles when ch.title_en or ch.title_ar is absent.
 */
export const CHAPTER_TOPIC_TRANSLATIONS: Record<string, { en: string; ar: string }> = {
  'تعریف علم و تقسیم به تصور و تصدیق': { en: 'Definition of Knowledge: Conception vs. Assent', ar: 'تعريف العلم وتقسيمه إلى التصور والتصديق' },
  'مباحث الفاظ، دلالت و اقسام سه‌گانه آن': { en: 'Semantics, Signification and Its Threefold Division', ar: 'مباحث الألفاظ والدلالة وأقسامها الثلاثة' },
  'نسبت‌های چهارگانه میان مفاهیم کلی': { en: 'The Four Logical Relations Between Universal Concepts', ar: 'النسب الأربع بين المفاهيم الكلية' },
  'کلیات خمس (جنس، فصل، نوع، عرض عام و خاص)': { en: 'The Five Universals (Porphyrian Isagoge)', ar: 'الكليات الخمس (الجنس، الفصل، النوع، العرض العام والخاص)' },
  'معرف و شروط تعریف، حد تام و رسم تام': { en: 'Rules of Definition: Essential Definition vs. Description', ar: 'شروط التعريف: الحد التام والرسم التام' },
  'قضایا و ساختار تصدیقات (حملیه و شرطیه)': { en: 'Propositions and Assent Structure (Categorical & Conditional)', ar: 'القضايا وبنية التصديقات (الحملية والشرطية)' },
  'احکام قضایا، تناقض و عکس مستوی': { en: 'Rules of Opposition, Contradiction and Conversion', ar: 'أحكام القضايا، التناقض والعكس المستوي' },
  'حجت و قیاس اقترانی، اشکال اربعه': { en: 'Syllogisms and the Four Classical Figures', ar: 'الحجة والقياس الاقتراني، الأشكال الأربعة' },
  'صناعات خمس، تحلیل برهان و دفع مغالطات': { en: 'The Five Arts, Analysis of Demonstration and Fallacies', ar: 'الصناعات الخمس، تحليل البرهان ودفع المغالطات' },
  'خطبه کتاب اسفار، سلوک فی الحق و مقاصد اربعه سفر عقلانی': { en: 'Prologue of Asfar: Intellectual Journey & The Four Spiritual Stations', ar: 'خطبة كتاب الأسفار، السلوك في الحق ومقاصد الأسفار الأربعة' },
  'اصالت وجود در برابر اصالت ماهیت و نقد شبهات محقق دوانی': { en: 'Primacy of Existence vs. Quiddity & Refutation of Dawani', ar: 'أصالة الوجود في قبال أصالة الماهية ودفع شبهات الدواني' },
  'تشکیک وجود و دفع شبهات فخر رازی و متکلمان': { en: 'Gradation of Being (Tashkik) & Rebuttal of Fakhr Razi', ar: 'تشكيك الوجود ودفع شبهات الفخر الرازي والمتكلمين' },
  'عدم و احکام عدمیه، بطلان شیئیت معدوم': { en: 'Non-Being and Negative Predication: Nihility of the Non-Existent', ar: 'العدم وأحكامه، بطلان شيئية المعدوم' },
  'برهان صدیقین صدرایی بر وجوب و وحدت حقیقت هستی': { en: 'Burhan al-Siddiqin (Proof of the Sincere) for Necessary Being', ar: 'برهان الصديقين الصدرائي على وجوب ووحدة حقيقة الوجود' },
  'دیباچه حکمت اشراق، سلوک نوری و روش‌شناسی سهروردی': { en: 'Prologue to Philosophy of Illumination: Suhrawardi\'s Luminous Method', ar: 'ديباجة حكمة الإشراق، السلوك النوري ومنهج السهروردي' },
  'نقد منطق ارسطویی در بخش اول حکمت اشراق': { en: 'Critique of Aristotelian Logic in Illuminationist Philosophy', ar: 'نقد المنطق الأرسطي في القسم الأول من حكمة الإشراق' },
  'حقیقت نور مجرد و بداهت نورانیت نفس': { en: 'Reality of Incorporeal Light & Self-Luminosity of the Soul', ar: 'حقيقة النور المجرد وبداهة نورانية النفس' },
  'قاعده امکان اشرف و مراتب صدور انوار قاهره': { en: 'Rule of the Nobler Possibility & Hierarchy of Dominating Lights', ar: 'قاعدة الإمكان الأشرف ومراتب صدور الأنوار القاهرة' },
  'برهان نورالانوار و توحید اشراقی در عالم اعلی': { en: 'Proof of the Light of Lights & Illuminationist Monotheism', ar: 'برهان نور الأنوار والتوحيد الإشراقي في العالم الأعلى' },
  'مدخل بدایة الحکمة، تعریف موضوع فلسفه اولی': { en: 'Introduction to Bidayat al-Hikmah: Subject Matter of First Philosophy', ar: 'مدخل بداية الحكمة، موضوع الفلسفة الأولى' },
  'بداهت مفهوم وجود و ادله اثبات اصالت وجود': { en: 'Self-Evidence of Existence Concept & Proofs for Primacy of Being', ar: 'بداهة مفهوم الوجود وأدلة إثبات أصالة الوجود' },
  'حقیقت وجود و نفی ترکب در هویت صرف الوجود': { en: 'Reality of Being & Absolute Simplicity of Pure Existence', ar: 'حقيقة الوجود ونفي التركب في هوية صرف الوجود' },
  'قاعده الواحد لا یصدر عنه الا الواحد و تبیین فیض اول': { en: 'Principle that from the One Emanates Only One & The First Effusion', ar: 'قاعدة الواحد لا يصدر عنه إلا الواحد وتبيين الفيض الأول' },
  'وجود ذهنی و حل معضل مطابقت ذهن و عین': { en: 'Mental Existence & The Problem of Subject-Object Correspondence', ar: 'الوجود الذهني وحل إشكالية مطابقة الذهن والخارج' },
  'نقشه راه سلوک عقلی در متون کهن': { en: 'Roadmap of Rational Wayfaring in Classical Texts', ar: 'خارطة طريق السلوك العقلي في النصوص القديمة' },
  'تحلیل برهان وحدت شخصی در اسفار': { en: 'Analysis of Individual Unity of Being in Asfar', ar: 'تحليل برهان الوحدة الشخصية في الأسفار' },
  'گزارش اجمالی از فیزیکالیسم تقلیلی و غیرتقلیلی': { en: 'Overview of Reductive and Non-Reductive Physicalism', ar: 'تقرير إجمالي عن الفيزيائية الاختزالية وغير الاختزالية' },
  'رویکرد متدولوژیک به تفکر آزاد در فلسفه صدرایی': { en: 'Methodological Approach to Free Inquiry in Sadrian Philosophy', ar: 'المنهجية في التفكير الحر في الفلسفة الصدرائية' },
  'ضرورت فلسفه و ماهیت تفکر عقلی': { en: 'The Necessity of Philosophy & The Nature of Rational Thought', ar: 'ضرورة الفلسفة وطبيعة التفكير العقلي' },
  'تولد سوژه در تفکر دکارت و بحران یقین در غرب': { en: 'Birth of the Subject in Cartesian Thought & The Crisis of Certainty', ar: 'ولادة الذاتية في الفكر الديكارتي وأزمة اليقين في الغرب' },
  'نقد کانت بر مابعدالطبیعه سنتی و پاسخ حکمت صدرایی': { en: 'Kant\'s Critique of Traditional Metaphysics & The Sadrian Defense', ar: 'نقد كانط للميتافيزيقا التقليدية وجواب الحكمة الصدرائية' },
  'حقیقت کتاب الله و مراتب نزول وحی و تاویل وجودی': { en: 'Reality of the Divine Book, Stations of Revelation & Ontological Hermeneutics', ar: 'حقيقة كتاب الله ومراتب نزول الوحي والتأويل الوجودي' },
  'شرح بیت «فیه تجلی باهر لمن درى» و تعریف فلسفه': { en: 'Commentary on "Fihi Tajallin Bahirun" & Definition of Philosophy', ar: 'شرح بيت «فيه تجلٍ باهر لمن درى» وتعريف الفلسفة' },
  'دیباچه کتاب و مشهد اول در امور عامه الهی': { en: 'Book Preface & First Scene on General Divine Matters', ar: 'ديباجة الكتاب والمشهد الأول في الأمور العامة الإلهية' },
  'صد منزل سلوک و اهمیت استاد راهنما در گذر از ظلمات نفس': { en: 'The Hundred Stations of the Soul & The Necessity of a Spiritual Guide', ar: 'منازل السائرين وأهمية الأستاذ المرشد في قطع ظلمات النفس' },
  'باب البدایات: حقیقت یقظه (بیداری قلب از خواب غفلت)': { en: 'Chapter of Beginnings: The Reality of Vigilance (Yaqazah)', ar: 'باب البدايات: حقيقة اليقظة وانتباه القلب من الغفلة' },
  'باب التوبة: شرایط سه‌گانه توبه نصوح و جبران مافات': { en: 'Chapter of Repentance: The Three Conditions of Sincere Repentance', ar: 'باب التوبة: الشروط الثلاثة للتوبة النصوح وتدارك ما فات' },
  'باب المحاسبة: مراقبه دائمی و میزان سنجش اعمال': { en: 'Chapter of Accounting: Perpetual Vigilance and Moral Metrics', ar: 'باب المحاسبة: المراقبة الدائمة وميزان الأعمال' },
  'دیباچه کتاب و اصول قواعد توحید ذاتی و اسمی': { en: 'Preface & Fundamental Axioms of Essential and Attributive Tawhid', ar: 'ديباجة الكتاب وقواعد التوحيد الذاتي والأسمائي' },
  'فص حکمة الهیة فی کلمة آدمیة؛ آفرینش انسان کامل به عنوان مرآت وجود': { en: 'Ringstone of Divine Wisdom in the Word of Adam: The Perfect Human', ar: 'فص حكمة إلهية في كلمة آدمية؛ خلق الإنسان الكامل كمرآة للوجود' },
  'نسبت اعیان ثابته با اسماء الهیه در فص آدمی': { en: 'Relation of Immutable Entities to Divine Names in the Adamic Word', ar: 'نسبة الأعيان الثابتة بالأسماء الإلهية في الفص الآدمي' },
  'فصل اول در وجود و احکام آن که عین حق تعالی است': { en: 'Section One: On Being and Its Predicates as the True Reality', ar: 'الفصل الأول في الوجود وأحكامه التي هي عين الحق تعالى' },
  'مقصد اول در امور عامه کلامی و اثبات نیاز به مبدأ': { en: 'Destination One: General Theological Premises & The Need for a Cause', ar: 'المقصد الأول في الأمور العامة الكلامية وإثبات الحاجة إلى المبدأ' },
  'برهان امکان و وجوب در اثبات واجب تعالی': { en: 'Argument from Contingency and Necessity for the Necessary Being', ar: 'برهان الإمكان والوجوب في إثبات الواجب تعالى' },
  'مقدمه نهایه و مراتب عقلانیت فلسفی': { en: 'Introduction to Nihayat al-Hikmah & Levels of Philosophical Intellect', ar: 'مقدمة النهاية ومراتب العقلانية الفلسفية' },
  'مبحث مقولات عشره و نقد اعتباری بودن کم و کیف': { en: 'The Ten Categories & Reassessment of Quantity and Quality', ar: 'مبحث المقولات العشر ونقد اعتبارية الكم والكيف' },
  'مدخل بر منطق مادی و اصول مقدمات برهانی': { en: 'Introduction to Material Logic & Principles of Demonstrative Premises', ar: 'مدخل إلى المنطق المادي وأصول المقدمات البرهانية' },
  'شرایط یقین و اصول اولیات و وجدانیات': { en: 'Epistemic Conditions of Certainty & Primary Intuitions', ar: 'شروط اليقين وأصول الأوليات والوجدانيات' },
  'قواعد تعریف، حد و رسم و مغالطه دَور': { en: 'Rules of Definition & The Fallacy of Circularity', ar: 'قواعد التعريف بالحد والرسم ومغالطة الدور' },
  'قضایای شرطیه، اقسام اتصال و انفصال': { en: 'Conditional Propositions: Conjunctive and Disjunctive Types', ar: 'القضايا الشرطية، أقسام الاتصال والانفصال' },
  'مدخل بر الهیات شفا و اثبات وجود واجب بذاته': { en: 'Introduction to Metaphysics of Al-Shifa & Existence of Necessary Being', ar: 'مدخل إلى إلهيات الشفاء وإثبات وجود الواجب بذاته' },
  'نمط اول در تجوهر اجسام و ترکیب ماده و صورت': { en: 'First Pattern on Substantiality of Bodies & Hylomorphism (Matter & Form)', ar: 'النمط الأول في تجوهر الأجسام وتركيب المادة والصورة' },
  'حقیقت علم و تمایز ادراک حصولی از حضوری': { en: 'Reality of Knowledge & Acquired vs. Knowledge by Presence', ar: 'حقيقة العلم والتمايز بين الإدراك الحصولي والحضوري' },
  'تعریف علم اصول و موضوع آن و تمایز مسائل اصولی از فقهی': { en: 'Definition of Usul al-Fiqh, Its Subject & Demarcation from Fiqh', ar: 'تعريف علم الأصول وموضوعه والتمايز بين المسائل الأصولية والفقهية' },
  'تمایز دلیل شرعی از عقلی و ماهیت جعل حکم شرعی': { en: 'Demarcation of Scriptural vs. Rational Evidence in Legal Enactment', ar: 'التمايز بين الدليل الشرعي والعقلي وماهية جعل الحكم الشرعي' },
  'تقسیم حالات مکلف به قطع و ظن و شک و ذاتی بودن کاشفیت قطع': { en: 'Epistemic States of the Obligated Agent (Certainty, Conjecture, Doubt)', ar: 'تقسيم حالات المكلف إلى القطع والظن والشك وذاتية كاشفية القطع' },
  'تقسیم مکاسب به محرمه و مباحه و قاعده حرمت اعانت بر اثم': { en: 'Division of Commerce into Forbidden and Permissible & Prohibition of Sinful Aid', ar: 'تقسيم المكاسب إلى المحرمة والمباحة وقاعدة حرمة الإعانة على الإثم' },
  'شرط البلوغ فی المتعاقدین و ادله عدم نفوذ معاملات صبی': { en: 'Requirement of Maturity in Contracting Parties & Invalidation of Minor\'s Contracts', ar: 'شرط البلوغ في المتعاقدين وأدلة عدم نفوذ معاملات الصبي' },
  'تعریف عیب و ملاک تشخیص نقص و زیاده در مبیع': { en: 'Definition of Defect & Legal Criteria for Flaws in Commercial Goods', ar: 'تعريف العيب ومعيار تشخيص النقص والزيادة في المبيع' },
  'تمایز روش‌شناسی عرفان نظری از فلسفه و کلام': { en: 'Methodological Demarcation: Theoretical Mysticism vs. Philosophy and Theology', ar: 'تمايز منهجية العرفان النظري عن الفلسفة وعلم الكلام' },
  'در حرکت سالک و شرایط مقدماتی سفر الی الله': { en: 'The Wayfarer\'s Motion & Preliminary Prerequisites for Journey to God', ar: 'في حركة السالك والشروط التمهيدية للسفر إلى الله' },
  '«الم * ذلك الکتاب لا ریب فیه»؛ هدایت متقین و درجات ایمان غیب': { en: '\'Alif Lam Mim, That is the Book without Doubt\': Guidance and Unseen Faith', ar: '«الم * ذلك الكتاب لا ريب فيه»؛ هداية المتقين ومراتب الإيمان بالغيب' },
  'دیباچه کتاب، تعریف منطق و نیاز اندیشه به قانون تفکر': { en: 'Preface: Definition of Logic and the Mind\'s Need for Laws of Thought', ar: 'ديباجة الكتاب، تعريف المنطق وحاجة الفكر إلى قانون التفكير' },
  'مفاهیم کلی و جزئی و مراتب تجرید عقلانی': { en: 'Universal and Particular Concepts & Levels of Intellectual Abstraction', ar: 'المفاهيم الكلية والجزئية ومراتب التجريد العقلي' },
};

/**
 * Translates chapter titles when ch.title_en or ch.title_ar is absent.
 */
export function getLocalizedChapterTitle(ch: any, lang: SupportedLang): string {
  const direct = ch?.[`title_${lang}`];
  if (direct && typeof direct === 'string' && direct.trim()) {
    return direct;
  }
  const titleFa: string = ch?.title_fa || ch?.title || '';
  if (lang === 'fa' || !titleFa) return titleFa;

  // Split into session prefix and topic
  const sessionMatch = titleFa.match(/^(جلسه\s*[۰-۹\d]+|جلسه\s*افتتاحیه|جلسه\s*نخست|جلسه\s*اول|جلسه\s*دوم|جلسه\s*سوم)\s*[:：\-]\s*(.*)$/i);

  if (sessionMatch) {
    const rawPrefix = sessionMatch[1].trim();
    const topic = sessionMatch[2].trim();
    const translation = CHAPTER_TOPIC_TRANSLATIONS[topic];

    if (lang === 'en') {
      let prefixEn = 'Session';
      const numMatch = rawPrefix.match(/[۰-۹\d]+/);
      if (numMatch) {
        const westernNum = numMatch[0].replace(/[۰-۹]/g, (d: string) => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]);
        prefixEn = `Session ${parseInt(westernNum, 10)}`;
      } else if (rawPrefix.includes('افتتاحیه')) {
        prefixEn = 'Inaugural Session';
      } else if (rawPrefix.includes('نخست') || rawPrefix.includes('اول')) {
        prefixEn = 'Session 1';
      } else if (rawPrefix.includes('دوم')) {
        prefixEn = 'Session 2';
      } else if (rawPrefix.includes('سوم')) {
        prefixEn = 'Session 3';
      }

      if (translation?.en) {
        return `${prefixEn}: ${translation.en}`;
      }
      return `${prefixEn}: ${topic}`;
    }

    if (lang === 'ar') {
      let prefixAr = 'الجلسة';
      const numMatch = rawPrefix.match(/[۰-۹\d]+/);
      if (numMatch) {
        const arabicNum = numMatch[0].replace(/[۰-۹]/g, (d: string) => '٠١٢٣٤٥٦٧٨٩'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]);
        prefixAr = `الجلسة ${arabicNum}`;
      } else if (rawPrefix.includes('افتتاحیه')) {
        prefixAr = 'الجلسة الافتتاحية';
      } else if (rawPrefix.includes('نخست') || rawPrefix.includes('اول')) {
        prefixAr = 'الجلسة الأولى';
      } else if (rawPrefix.includes('دوم')) {
        prefixAr = 'الجلسة الثانية';
      } else if (rawPrefix.includes('سوم')) {
        prefixAr = 'الجلسة الثالثة';
      }

      if (translation?.ar) {
        return `${prefixAr}: ${translation.ar}`;
      }
      return `${prefixAr}: ${topic}`;
    }
  }

  // Fallback direct translation if no prefix matched
  if (CHAPTER_TOPIC_TRANSLATIONS[titleFa]) {
    return lang === 'en' ? CHAPTER_TOPIC_TRANSLATIONS[titleFa].en : lang === 'ar' ? CHAPTER_TOPIC_TRANSLATIONS[titleFa].ar : titleFa;
  }

  if (lang === 'en') {
    return titleFa
      .replace(/^جلسه\s*([۰-۹\d]+)\s*[:：\-]/i, (_, num) => {
        const westernNum = num.replace(/[۰-۹]/g, (d: string) => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]);
        return `Session ${parseInt(westernNum, 10)}:`;
      })
      .replace(/جلسه افتتاحیه[:：]/g, 'Inaugural Session:')
      .replace(/جلسه نخست[:：]/g, 'Session 1:')
      .replace(/جلسه اول[:：]/g, 'Session 1:')
      .replace(/جلسه دوم[:：]/g, 'Session 2:')
      .replace(/جلسه سوم[:：]/g, 'Session 3:');
  }

  if (lang === 'ar') {
    return titleFa
      .replace(/^جلسه\s*([۰-۹\d]+)\s*[:：\-]/i, (_, num) => {
        const arabicNum = num.replace(/[۰-۹]/g, (d: string) => '٠١٢٣٤٥٦٧٨٩'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)]);
        return `الجلسة ${arabicNum}:`;
      })
      .replace(/جلسه افتتاحیه[:：]/g, 'الجلسة الافتتاحية:')
      .replace(/جلسه نخست[:：]/g, 'الجلسة الأولى:')
      .replace(/جلسه اول[:：]/g, 'الجلسة الأولى:')
      .replace(/جلسه دوم[:：]/g, 'الجلسة الثانية:')
      .replace(/جلسه سوم[:：]/g, 'الجلسة الثالثة:');
  }

  return titleFa;
}

/**
 * Localized representation of a course for clean component rendering.
 */
export function getLocalizedCourse(course: any, lang: SupportedLang) {
  if (!course) return null;
  return {
    id: course.id,
    title: getLocalized(course, 'title', lang),
    desc: getLocalized(course, 'desc', lang),
    instructor: getLocalized(course, 'instructor', lang),
    duration: getLocalized(course, 'duration', lang),
    level: getLocalized(course, 'level', lang),
    price: getLocalized(course, 'price', lang),
    subject: getLocalizedSubject(course.subject, lang),
    course_type: course.course_type,
    episodes_count: course.episodes_count,
    sampleAudioUrl: course.sampleAudioUrl,
    capacity: course.capacity,
    enrolledCount: course.enrolledCount,
    schedule: getLocalizedSchedule(course.schedule, lang),
    chapters: (course.chapters || []).map((ch: any) => ({
      ...ch,
      title: getLocalizedChapterTitle(ch, lang),
      duration: formatLocalizedNumber(ch.duration || '', lang),
    })),
  };
}

/**
 * Localized representation of a category.
 */
export function getLocalizedCategory(category: any, lang: SupportedLang) {
  if (!category) return null;
  return {
    id: category.id,
    slug: category.slug,
    iconName: category.iconName,
    name: getLocalized(category, 'name', lang),
    description: getLocalized(category, 'description', lang),
  };
}

/**
 * Localized representation of a scholarly article.
 */
export function getLocalizedArticle(article: any, lang: SupportedLang) {
  if (!article) return null;
  return {
    id: article.id,
    slug: article.slug,
    title: getLocalized(article, 'title', lang),
    category: getLocalized(article, 'category', lang),
    readTime: getLocalized(article, 'readTime', lang),
    publishDate: getLocalized(article, 'publishDate', lang),
    abstract: getLocalized(article, 'abstract', lang),
    author: getLocalized(article, 'author', lang),
  };
}

/**
 * Localized representation of a book.
 */
export function getLocalizedBook(book: any, lang: SupportedLang) {
  if (!book) return null;
  return {
    id: book.id,
    title: getLocalized(book, 'title', lang),
    author: getLocalized(book, 'author', lang),
    desc: getLocalized(book, 'desc', lang),
    price: getLocalized(book, 'price', lang),
    badge: getLocalized(book, 'badge', lang),
    cover_image: book.cover_image,
    isbn: book.isbn,
    isComingSoon: book.isComingSoon,
    pages: book.pages,
  };
}
