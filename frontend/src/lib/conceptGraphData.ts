/**
 * Rational Sciences Concept Graph (شبکه ارتباطی مفاهیم علوم عقلی)
 * Curated ontological network for Hayat platform.
 */

export type DisciplineType = 'falsafe' | 'mantiq' | 'erfan' | 'osul';

export interface ConceptNode {
  id: string;
  discipline: DisciplineType;
  title_fa: string;
  title_ar: string;
  title_en: string;
  tagline_fa: string;
  tagline_ar: string;
  tagline_en: string;
  description_fa: string;
  description_ar: string;
  description_en: string;
  keyScholars: string[];
  relatedCourseSlug: string;
  relatedCourseTitle_fa: string;
  relatedCourseTitle_ar: string;
  relatedCourseTitle_en: string;
  relatedBookTitle_fa: string;
  x: number; // 0 to 1000 scale
  y: number; // 0 to 600 scale
  tier: 1 | 2 | 3; // 1: foundational, 2: intermediate, 3: advanced
}

export interface ConceptEdge {
  id: string;
  source: string;
  target: string;
  label_fa: string;
  label_ar: string;
  label_en: string;
  type: 'foundation' | 'necessity' | 'derivation' | 'culmination';
}

export const conceptNodesData: ConceptNode[] = [
  // --- منطق و معرفت‌شناسی ---
  {
    id: 'mantiq-soori',
    discipline: 'mantiq',
    title_fa: 'منطق صوری و تراز تفکر',
    title_ar: 'المنطق الصوري وميزان الفكر',
    title_en: 'Formal Logic & Syllogism',
    tagline_fa: 'قواعد سنجش صورت استدلال و پرهیز از خطای ساختاری',
    tagline_ar: 'قواعد تقييم صورة الاستدلال وتجنب الخطأ الصوري',
    tagline_en: 'Rules governing structural validity and deduction',
    description_fa:
      'منطق ابزاری است قانونی که مراعات آن ذهن را از خطا در اندیشه بازمی‌دارد. تبیین معرفت از قیاس‌های اقترانی و استثنایی آغاز می‌شود و زمینه را برای ورود به برهان مهیا می‌کند.',
    description_ar:
      'المنطق آلة قانونية تعصم مراعاتها الذهن عن الخطأ في الفكر؛ من الأقيسة الاقترانية والاستثنائية إلى تشكيل مقدمات البراهين.',
    description_en:
      'An organon preventing cognitive errors in deductive reasoning, moving from categorical syllogisms to demonstrative premises.',
    keyScholars: ['ارسطو', 'فارابی', 'شیخ الرئیس ابن سینا', 'علامه مظفر'],
    relatedCourseSlug: 'mantiq-mozaffar-soori',
    relatedCourseTitle_fa: 'منطق مظفر (بخش صوری)',
    relatedCourseTitle_ar: 'منطق المظفر (القسم الصوري)',
    relatedCourseTitle_en: 'Al-Muzaffar Logic (Formal)',
    relatedBookTitle_fa: 'المنطق',
    x: 120,
    y: 180,
    tier: 1,
  },
  {
    id: 'borhan-va-yaqin',
    discipline: 'mantiq',
    title_fa: 'صناعت برهان و یقین‌شناسی',
    title_ar: 'صناعة البرهان ونظرية اليقين',
    title_en: 'Demonstration & Epistemology of Certainty',
    tagline_fa: 'تمییز گزاره‌های اولی و یقینی از خطابه و مغالطه',
    tagline_ar: 'التمييز بين الأوليات واليقينيات وبين الخطابة والمغالطة',
    tagline_en: 'Discerning necessary first principles from sophistry',
    description_fa:
      'صناعت برهان شریف‌ترین صناعات خمس است که مرکب از قضایای یقینیه بوده و مطلوب را با ضرورت و دوام نتیجه می‌دهد و پایه براهین متافیزیکی است.',
    description_ar:
      'صناعة البرهان أشرف الصناعات الخمس؛ تتألف من قضايا يقينية وتنتج المطلوب بالضرورة والدوام، وتشكل أساس البراهين الفلسفية.',
    description_en:
      'The crown of the Organon; constructing necessary and universal knowledge on axiomatic foundations.',
    keyScholars: ['ابن سینا', 'خواجه نصیرالدین طوسی', 'علامه حلی'],
    relatedCourseSlug: 'mantiq-mozaffar-madi',
    relatedCourseTitle_fa: 'منطق مظفر (صناعات خمس)',
    relatedCourseTitle_ar: 'منطق المظفر (الصناعات الخمس)',
    relatedCourseTitle_en: 'Al-Muzaffar Logic (Five Arts)',
    relatedBookTitle_fa: 'الجوهر النضید',
    x: 260,
    y: 280,
    tier: 1,
  },

  // --- هستی‌شناسی و فلسفه پایه ---
  {
    id: 'asalat-al-wojood',
    discipline: 'falsafe',
    title_fa: 'اصالت وجود',
    title_ar: 'أصالة الوجود',
    title_en: 'Primacy of Existence',
    tagline_fa: 'تحقق عینی از آنِ وجود است و ماهیت حد عدمی آن است',
    tagline_ar: 'التحقق العيني للوجود وما الماهية إلا حد اعتباري له',
    tagline_en: 'Concrete reality belongs to existence, not quiddity',
    description_fa:
      'ام‌المسائل حکمت متعالیه؛ بر پایه این اصل، آنچه اصالتاً متن واقعیت را پر کرده وجود است و ماهیات، قالب‌های انتزاعی عقل در ادراک حدود مراتب هستی هستند.',
    description_ar:
      'أصل الأصول في الحكمة المتعالية؛ الواقعية العينية متحققة بالوجود أصالةً، والماهيات اعتبارية منتزعة من حدود المراتب.',
    description_en:
      'The cornerstone of Sadrian metaphysics: actual reality consists purely of existence, while essences are conceptual boundaries.',
    keyScholars: ['ملاصدرا', 'آقا علی مدرس', 'علامه طباطبایی'],
    relatedCourseSlug: 'bedayat-al-hekmah',
    relatedCourseTitle_fa: 'بدایة الحکمة (دوره کامل)',
    relatedCourseTitle_ar: 'بداية الحكمة (دورة كاملة)',
    relatedCourseTitle_en: 'Bidayat al-Hikmah (Complete Course)',
    relatedBookTitle_fa: 'بدایة الحکمة',
    x: 420,
    y: 190,
    tier: 1,
  },
  {
    id: 'tashkik-al-wojood',
    discipline: 'falsafe',
    title_fa: 'تشکیک وجود',
    title_ar: 'تشكيك الوجود',
    title_en: 'Gradation of Being',
    tagline_fa: 'وحدت حقیقت هستی در عین کثرت مراتب و درجات',
    tagline_ar: 'وحدة حقيقة الوجود مع كثرة المراتب والدرجات التشكيكية',
    tagline_en: 'Graduated multiplicity within ontological unity',
    description_fa:
      'حقیقت وجود واحد است اما دارای مراتب شدت و ضعف، کمال و نقص؛ مابه‌الامتیاز در این حقیقت عینی همان مابه‌الاشتراک است (کما فی النور).',
    description_ar:
      'حقيقة الوجود واحدة ذات مراتب متفاضلة شدةً وضعفاً؛ ما به الامتياز فيها عين ما به الاشتراك كما في مثال النور.',
    description_en:
      'Existence is a single reality manifesting across a continuum of intensity and deficiency, from the necessary to the contingent.',
    keyScholars: ['شیخ اشراق سهروردی', 'ملاصدرا', 'حکیم سبزواری'],
    relatedCourseSlug: 'shawahed-al-rooboobiyah',
    relatedCourseTitle_fa: 'الشواهد الربوبیة',
    relatedCourseTitle_ar: 'الشواهد الربوبية',
    relatedCourseTitle_en: 'Al-Shawahid al-Rububiyyah',
    relatedBookTitle_fa: 'شرح المنظومة',
    x: 580,
    y: 120,
    tier: 2,
  },
  {
    id: 'ellate-va-maalool',
    discipline: 'falsafe',
    title_fa: 'علیت و فقر وجودی',
    title_ar: 'العلية والفقر الوجودي',
    title_en: 'Causality & Ontological Dependence',
    tagline_fa: 'معلول عین ربط و تعلق به علت هستی‌بخش است',
    tagline_ar: 'المعلول عين الربط والتعلق بالعلة المفيضة',
    tagline_en: 'The effect is pure existential relation to the cause',
    description_fa:
      'معلول چیزی نیست که ربط داشته باشد، بلکه عین ربط و فقر محض به مبدأ فیض است؛ از این رو استقلال وجودی تنها از آنِ واجب‌الوجود بالذات است.',
    description_ar:
      'المعلول ليس شيئاً له ربط، بل هو عين الارتباط والفقر المحض إلى الواجب مفيض الوجود.',
    description_en:
      'Causality redefined from external interaction to essential existential contingency and relation.',
    keyScholars: ['ابن سینا', 'ملاصدرا', 'علامه طباطبایی'],
    relatedCourseSlug: 'nehayat-al-hekmah',
    relatedCourseTitle_fa: 'نهایة الحکمة',
    relatedCourseTitle_ar: 'نهاية الحكمة',
    relatedCourseTitle_en: 'Nihayat al-Hikmah',
    relatedBookTitle_fa: 'نهایة الحکمة',
    x: 420,
    y: 350,
    tier: 2,
  },

  // --- حکمت عالیه صدرایی ---
  {
    id: 'harkat-jowhari',
    discipline: 'falsafe',
    title_fa: 'حرکت جوهری',
    title_ar: 'الحركة الجوهرية',
    title_en: 'Substantial Motion',
    tagline_fa: 'سیلان و تجدد در ذات و جوهر ماده و عالم طبیعت',
    tagline_ar: 'السيلان والتجدد في ذات الجوهر المادي وعالم الطبيعة',
    tagline_en: 'Intrinsic continuous flux of material substance',
    description_fa:
      'طبیعت پیوسته در جوهر خود در گذر و استکمال است؛ زمان بعد چهارم جسم مادی و نفس جسمانیة الحدوث و روحانیة البقاء است.',
    description_ar:
      'عالم المادة في سيلان مستمر وتكامل في ذات جوهره؛ والزمان بعد رابع للمادة، والنفس جسمانية الحدوث روحانية البقاء.',
    description_en:
      'Material nature undergoes continuous transformation at the substantial core, resolving the mind-body problem.',
    keyScholars: ['ملاصدرا', 'آقا محمدرضا قمشه‌ای', 'علامه حسن‌زاده آملی'],
    relatedCourseSlug: 'al-asfar-al-arbaah',
    relatedCourseTitle_fa: 'الاسفار الاربعة (سفر اول و نفس)',
    relatedCourseTitle_ar: 'الأسفار الأربعة (السفر الأول والنفس)',
    relatedCourseTitle_en: 'Al-Asfar al-Arba’ah (First Journey & Soul)',
    relatedBookTitle_fa: 'الحکمة المتعالیة فی الاسفار الاربعة',
    x: 620,
    y: 260,
    tier: 3,
  },
  {
    id: 'ettehad-aqel-maaqool',
    discipline: 'falsafe',
    title_fa: 'اتحاد عاقل و معقول',
    title_ar: 'اتحاد العاقل والمعقول',
    title_en: 'Union of Intellect & Intelligible',
    tagline_fa: 'ادراک، حصول صورت نیست بلکه انکشاف و یگانگی وجودی است',
    tagline_ar: 'الإدراك ليس انطباعاً صورياً بل هو اتحاد وجودي بين العالم والمعلوم',
    tagline_en: 'Epistemology as existential convergence of subject and object',
    description_fa:
      'نفس در مرتبه تعقل با معقولات متحد می‌شود؛ مراتب علم با مراتب وجود انسان تطابق دارند و معرفت، ارتقای درجه هستی ادراک‌کننده است.',
    description_ar:
      'النفس في مقام التعقل تتحد مع الصور العقلية؛ مراتب العلم تساوق مراتب الوجود.',
    description_en:
      'Knowledge is not representation, but an existential ascension where the knower and known unite.',
    keyScholars: ['فرفوریوس', 'ملاصدرا', 'علامه رفیعی قزوینی'],
    relatedCourseSlug: 'al-asfar-al-arbaah',
    relatedCourseTitle_fa: 'الاسفار الاربعة',
    relatedCourseTitle_ar: 'الأسفار الأربعة',
    relatedCourseTitle_en: 'Al-Asfar al-Arba’ah',
    relatedBookTitle_fa: 'مفاتیح الغیب',
    x: 630,
    y: 430,
    tier: 3,
  },
  {
    id: 'borhan-seddighin',
    discipline: 'falsafe',
    title_fa: 'برهان صدیقین',
    title_ar: 'برهان الصديقين',
    title_en: 'Proof of the Sincere (Burhan al-Siddiqin)',
    tagline_fa: 'استدلال بر ذات واجب از متن حقیقت خودِ وجود، بی‌واسطه غیر',
    tagline_ar: 'الاستدلال على الحق بالحق من صميم حقيقة الوجود بلا واسطة خلق',
    tagline_en: 'Proving the Absolute through the intrinsic nature of existence',
    description_fa:
      'برهان صدیقین استوارترین طریق توحید است؛ در این برهان به جای سیر از مخلوق به خالق، حقیقت وجود خود شاهد بر وجوب ذاتی خویش است.',
    description_ar:
      'أوثق براهين التوحيد؛ حيث يشهد الوجود بحقيقته على وجوب ذاته وغناه المطلق دون الاستعانة بالحدوث أو الإمكان.',
    description_en:
      'The pinnacle of demonstrative theology: arguing from the reality of existence directly to Necessary Being.',
    keyScholars: ['ابن سینا', 'ملاصدرا', 'علامه طباطبایی'],
    relatedCourseSlug: 'al-asfar-al-arbaah',
    relatedCourseTitle_fa: 'شرح اسفار اربعه (الهیات)',
    relatedCourseTitle_ar: 'شرح الأسفار الأربعة (الإلهيات)',
    relatedCourseTitle_en: 'Exegesis of Asfar (Metaphysics)',
    relatedBookTitle_fa: 'الاسفار الاربعة',
    x: 780,
    y: 190,
    tier: 3,
  },

  // --- عرفان نظری ---
  {
    id: 'vahdat-shakhsiyah',
    discipline: 'erfan',
    title_fa: 'وحدت شخصیه وجود',
    title_ar: 'الوحدة الشخصية للوجود',
    title_en: 'Personal/Absolute Unity of Being',
    tagline_fa: 'وجود حقیقت واحده لاشریک له است و ما سوا ظهور و تجلی اوست',
    tagline_ar: 'الوجود حقيقة شخصية واحدة وما سواه شؤون وتجليات',
    tagline_en: 'Absolute Ontological Unity; phenomena as divine theophanies',
    description_fa:
      'قله عرفان نظری؛ وجود در خارج مصداقی جز ذات حق ندارد. ماسوی‌الله موجودات مستقل نیستند بلکه مظاهر و شئون تجلی اسمائی و افعالی او هستند.',
    description_ar:
      'ذروة العرفان النظري؛ لا وجود عيني حقيقي إلا للحق سبحانه، وما الكائنات إلا مظاهر وتعينات لأسمائه وصفاته.',
    description_en:
      'The zenith of theoretical gnosis: only the Divine truly exists, with the cosmos functioning as His manifestation.',
    keyScholars: ['ابن عربی', 'صدرالدین قونوی', 'داوود قیصری', 'علامه حسن‌زاده آملی'],
    relatedCourseSlug: 'fosoos-al-hekam',
    relatedCourseTitle_fa: 'فصوص الحکم شیخ اکبر',
    relatedCourseTitle_ar: 'فصوص الحكم للشيخ الأكبر',
    relatedCourseTitle_en: 'Fusus al-Hikam by Ibn Arabi',
    relatedBookTitle_fa: 'فصوص الحکم',
    x: 880,
    y: 330,
    tier: 3,
  },
  {
    id: 'ayan-thabetah',
    discipline: 'erfan',
    title_fa: 'اعیان ثابته و مراتب تجلی',
    title_ar: 'الأعيان الثابتة ومراتب التجلي',
    title_en: 'Immutable Entities & Divine Emanations',
    tagline_fa: 'حقایق اشیاء در علم ازلی حق و فیض اقدس و مقدس',
    tagline_ar: 'صور الممكنات في العلم الإلهي الأزلي وسريان الفيضين',
    tagline_en: 'Archetypes within Divine Omniscience prior to outward manifestation',
    description_fa:
      'اعیان ثابته صور معقوله اسماء الهی در حضرت علمیه هستند که با فیض اقدس تعین یافته و با فیض مقدس به کسوت وجود خارجی درمی‌آیند.',
    description_ar:
      'الأعيان الثابتة هي حقائق الممكنات في الحضرة العلمية، تتعين بالفيض الأقدس وتظهر بالفيض المقدس.',
    description_en:
      'Divine archetypes existing eternally in divine knowledge, materialized through the most holy and holy emanations.',
    keyScholars: ['ابن عربی', 'ابن ترکه', 'سید حیدر آملی'],
    relatedCourseSlug: 'tamhid-al-ghawaed',
    relatedCourseTitle_fa: 'تمهید القواعد ابن‌ترکه',
    relatedCourseTitle_ar: 'تمهيد القواعد لابن تركة',
    relatedCourseTitle_en: 'Tamhid al-Qawa’id by Ibn Turkah',
    relatedBookTitle_fa: 'تمهید القواعد',
    x: 880,
    y: 470,
    tier: 3,
  },

  // --- اصول فقه و عقلانیت حقوقی ---
  {
    id: 'osul-amaliyah',
    discipline: 'osul',
    title_fa: 'اصول عملیه و فقه عقلانی',
    title_ar: 'الأصول العملية والفقه البرهاني',
    title_en: 'Procedural Principles & Legal Epistemology',
    tagline_fa: 'قواعد تعیین وظیفه در ظرف شک و انسداد دلیل اجتهادی',
    tagline_ar: 'قواعد تعيين الوظيفة العملية عند فقدان الدليل الاجتهادي',
    tagline_en: 'Normative procedural decision-making under epistemic doubt',
    description_fa:
      'اصول عملیه (برائت، استصحاب، احتیاط، تخییر) شاهکار منطق کاربردی شیعه در مدیریت شک و استنباط احکام با تکیه بر قبح عقاب بلابیان است.',
    description_ar:
      'الأصول العملية الأربعة تمثل إبداع الفكر الأصولي في هندسة الموقف العملي عند فقدان النص أو تعارضه.',
    description_en:
      'Rigorous legal logic resolving jurisprudential doubt via rationality, presumption of continuity, and accountability.',
    keyScholars: ['شیخ انصاری', 'آخوند خراسانی', 'شهید سید محمدباقر صدر'],
    relatedCourseSlug: 'kefayat-al-osul',
    relatedCourseTitle_fa: 'کفایة الاصول و رسائل',
    relatedCourseTitle_ar: 'كفاية الأصول والرسائل',
    relatedCourseTitle_en: 'Kifayat al-Usul & Rasa’il',
    relatedBookTitle_fa: 'فرائد الاصول',
    x: 230,
    y: 470,
    tier: 2,
  },
];

export const conceptEdgesData: ConceptEdge[] = [
  // منطق -> برهان
  {
    id: 'e1',
    source: 'mantiq-soori',
    target: 'borhan-va-yaqin',
    label_fa: 'صورت‌بندی مقدمات',
    label_ar: 'صياغة المقدمات',
    label_en: 'Formal Syllogistic Base',
    type: 'foundation',
  },
  // برهان -> اصالت وجود
  {
    id: 'e2',
    source: 'borhan-va-yaqin',
    target: 'asalat-al-wojood',
    label_fa: 'اثبات برهانی مبدأ',
    label_ar: 'البرهان على الأصالة',
    label_en: 'Demonstrative Grounding',
    type: 'foundation',
  },
  // اصالت وجود -> تشکیک وجود
  {
    id: 'e3',
    source: 'asalat-al-wojood',
    target: 'tashkik-al-wojood',
    label_fa: 'تکثر در عین وحدت',
    label_ar: 'التشعب في المراتب',
    label_en: 'Hierarchical Gradation',
    type: 'necessity',
  },
  // اصالت وجود -> علیت
  {
    id: 'e4',
    source: 'asalat-al-wojood',
    target: 'ellate-va-maalool',
    label_fa: 'تبیین ربط وجودی',
    label_ar: 'تحليل الربط الوجودي',
    label_en: 'Existential Relation',
    type: 'derivation',
  },
  // تشکیک وجود -> برهان صدیقین
  {
    id: 'e5',
    source: 'tashkik-al-wojood',
    target: 'borhan-seddighin',
    label_fa: 'سیر از کمال به غایت',
    label_ar: 'السير نحو الغنى المحض',
    label_en: 'Direct Ascendance',
    type: 'culmination',
  },
  // علیت -> حرکت جوهری
  {
    id: 'e6',
    source: 'ellate-va-maalool',
    target: 'harkat-jowhari',
    label_fa: 'تجدد مستمر فیض',
    label_ar: 'استمرار الفيض في الذات',
    label_en: 'Perpetual Flux',
    type: 'derivation',
  },
  // حرکت جوهری -> اتحاد عاقل و معقول
  {
    id: 'e7',
    source: 'harkat-jowhari',
    target: 'ettehad-aqel-maaqool',
    label_fa: 'استکمال نفس تا ادراک',
    label_ar: 'تكامل النفس إلى التعقل',
    label_en: 'Intellective Evolution',
    type: 'necessity',
  },
  // برهان صدیقین -> وحدت شخصیه وجود
  {
    id: 'e8',
    source: 'borhan-seddighin',
    target: 'vahdat-shakhsiyah',
    label_fa: 'گذار از تشکیک به وحدت شهودی',
    label_ar: 'الانتقال إلى الشهود المطلق',
    label_en: 'Philosophical to Gnostic Transition',
    type: 'culmination',
  },
  // وحدت شخصیه -> اعیان ثابته
  {
    id: 'e9',
    source: 'vahdat-shakhsiyah',
    target: 'ayan-thabetah',
    label_fa: 'مراتب تجلی فیض اقدس',
    label_ar: 'مراتب التجلي العلمي',
    label_en: 'Archetypal Manifestation',
    type: 'necessity',
  },
  // برهان و یقین -> اصول عملیه
  {
    id: 'e10',
    source: 'borhan-va-yaqin',
    target: 'osul-amaliyah',
    label_fa: 'کاربست در تعارض و شک',
    label_ar: 'التطبيق في الشبهات والشك',
    label_en: 'Application to Epistemic Doubt',
    type: 'derivation',
  },
  // علیت -> اصول عملیه
  {
    id: 'e11',
    source: 'ellate-va-maalool',
    target: 'osul-amaliyah',
    label_fa: 'قاعده عقلی قبح عقاب',
    label_ar: 'المبنى العقلي لقبول العذر',
    label_en: 'Rational Accountability',
    type: 'foundation',
  },
];
