export interface StageData {
  id: string;
  stepNumber: number;
  title_fa: string;
  title_ar: string;
  title_en: string;
  category_fa: string;
  category_ar: string;
  category_en: string;
  subtitle_fa: string;
  subtitle_ar: string;
  subtitle_en: string;
  description_fa: string;
  description_ar: string;
  description_en: string;
  outcomes_fa: string[];
  outcomes_ar: string[];
  outcomes_en: string[];
  keyBooks_fa: string[];
  keyBooks_ar: string[];
  keyBooks_en: string[];
  sessionEstimate_fa: string;
  sessionEstimate_ar: string;
  sessionEstimate_en: string;
  level_fa: string;
  level_ar: string;
  level_en: string;
  coursesList: {
    title_fa: string;
    title_ar: string;
    title_en: string;
    sessions_fa: string;
    sessions_ar: string;
    sessions_en: string;
    slug: string;
  }[];
}

export const roadmapStagesData: StageData[] = [
  {
    id: 'stage-1',
    stepNumber: 1,
    title_fa: 'مبادی تفکر و منطق اجتهادی',
    title_ar: 'مبادئ التفكير والمنطق الاجتهادي',
    title_en: 'Foundations of Thought & Demonstrative Logic',
    category_fa: 'منطق',
    category_ar: 'المنطق',
    category_en: 'Logic',
    subtitle_fa: 'سازماندهی ذهن و ابزار سنجش استدلال‌ها',
    subtitle_ar: 'تنظيم الذهن وأدوات تقييم البراهين والأقيسة',
    subtitle_en: 'Structuring Cognition & Argument Assessment Tools',
    description_fa:
      'نخستین گام در سیر علوم عقلی، احاطه بر ابزار سنجش فکر و تمییز حجت از شبهه است. در این مرحله، دانش‌پژوه از تعریف الفاظ تا برهان، مغالطات و صناعات خمس را به شیوه اجتهادی فرامی‌گیرد.',
    description_ar:
      'الخطوة الأولى في مسار العلوم العقلية هي الإحاطة بميزان الفكر والتمييز بين الحجة والشبهة؛ من تعريف الألفاظ إلى البرهان والمغالطات والصناعات الخمس بمنهج اجتهادي تحليلي.',
    description_en:
      'The initial milestone in the rational sciences provides mastery over analytical discernment between sound proof and sophistry, ranging from semantic definitions to demonstrative syllogisms and fallacies.',
    outcomes_fa: [
      'تسلط کامل بر منطق صوری و منطق مادی',
      'کشف و رد ساختاری انواع مغالطات اندیشه‌ای',
      'مهارت در اقامه براهین لمّی و انّی',
    ],
    outcomes_ar: [
      'الإحاطة التامة بالمنطق الصوري والمنطق المادي',
      'كشف وتفنيد المغالطات الفكرية بصورة منهجية',
      'المهارة في إقامة البراهين اللمية والإنية',
    ],
    outcomes_en: [
      'Comprehensive mastery of formal and material logic',
      'Methodical deconstruction of cognitive fallacies',
      'Rigorous formulation of deductive proofs',
    ],
    keyBooks_fa: ['مبادی منطق', 'منطق مظفر (صوری و مادی)', 'حاشیه ملاعبدالله', 'جوهر النضید'],
    keyBooks_ar: ['مبادئ المنطق', 'منطق المظفر (الصوري والمادي)', 'حاشية ملا عبدالله', 'الجوهر النضيد'],
    keyBooks_en: ['Principles of Logic', 'Muzaffar Logic', 'Hashiyah of Mulla Abdullah', 'Jawhar al-Nadhid'],
    sessionEstimate_fa: '۵۵ جلسه استودیویی',
    sessionEstimate_ar: '٥٥ درساً مسجلاً',
    sessionEstimate_en: '55 Studio Lectures',
    level_fa: 'پایه اول عقلی',
    level_ar: 'المستوى العقلي الأول',
    level_en: 'Primary Rational Stage',
    coursesList: [
      {
        title_fa: 'مبادی منطق',
        title_ar: 'مبادئ المنطق',
        title_en: 'Principles of Logic',
        sessions_fa: '۸ جلسه',
        sessions_ar: '٨ دروس',
        sessions_en: '8 Sessions',
        slug: 'mabadi-mantiq',
      },
      {
        title_fa: 'منطق مظفر (بخش صوری)',
        title_ar: 'منطق المظفر (الصوري)',
        title_en: 'Al-Muzaffar Logic (Formal Part)',
        sessions_fa: '۱۵ جلسه',
        sessions_ar: '١٥ درساً',
        sessions_en: '15 Sessions',
        slug: 'mantiq-mozaffar-soori',
      },
      {
        title_fa: 'منطق مظفر (بخش مادی و صناعات)',
        title_ar: 'منطق المظفر (المادي والصناعات)',
        title_en: 'Al-Muzaffar Logic (Material & Five Arts)',
        sessions_fa: '۱۲ جلسه',
        sessions_ar: '١٢ درساً',
        sessions_en: '12 Sessions',
        slug: 'mantiq-mozaffar-madi',
      },
      {
        title_fa: 'حاشیه ملاعبدالله یزدی',
        title_ar: 'حاشية ملا عبدالله اليزدي',
        title_en: 'Hashiyah of Mulla Abdullah Yazdi',
        sessions_fa: '۱۴ جلسه',
        sessions_ar: '١٤ درساً',
        sessions_en: '14 Sessions',
        slug: 'hashiyeh-mollah-abdullah',
      },
      {
        title_fa: 'جوهر النضید فی شرح منطق التجرید',
        title_ar: 'الجوهر النضيد في شرح منطق التجريد',
        title_en: 'Jawhar al-Nadhid Exegesis',
        sessions_fa: '۶ جلسه',
        sessions_ar: '٦ دروس',
        sessions_en: '6 Sessions',
        slug: 'jowhar-al-nazid',
      },
    ],
  },
  {
    id: 'stage-2',
    stepNumber: 2,
    title_fa: 'حکمت و هستی‌شناسی پایه',
    title_ar: 'الحكمة والأنطولوجيا الأساسية',
    title_en: 'Fundamental Metaphysics & Ontology',
    category_fa: 'فلسفه',
    category_ar: 'الفلسفة',
    category_en: 'Philosophy',
    subtitle_fa: 'شروع سیر استدلالی در مبادی وجود و عوارض ماهیت',
    subtitle_ar: 'بداية السير الاستدلالي في مبادئ الوجود وأحكام الماهية',
    subtitle_en: 'Initiating Demonstrative Inquiry into Being & Quiddity',
    description_fa:
      'پس از تجهیز به منطق، ورود به ساحت فلسفه با بررسی مفاهیم اساسی هستی‌شناسی، اصالت وجود، احکام عدم، مواد ثلاث (وجوب، امکان، امتناع) و علل اربعه آغاز می‌شود.',
    description_ar:
      'بعد الإحاطة بالقواعد المنطقية، يدخل الباحث في الفلسفة العامة لدراسة أصالة الوجود، أحكام العدم، المواد الثلاث (الوجوب، الإمكان، الامتناع) والعلل الأربع.',
    description_en:
      'Equipped with rigorous logic, the scholar examines core ontology: primacy of existence, modality (necessity, contingency, impossibility), and causality.',
    outcomes_fa: [
      'فهم بداهت مفهوم و اصالت حقیقت عینی وجود',
      'تحلیل علیت و نظام احسن آفرینش',
      'آمادگی برای متون تطبیقی و مباحث عالی فلسفه',
    ],
    outcomes_ar: [
      'فهم بداهة مفهوم الوجود وأصالة حقيقته العينية',
      'تحليل برهاني لمبدأ العلية والنظام الأحسن',
      'الاستعداد للمتون المقارنة والمباحث العالية',
    ],
    outcomes_en: [
      'Comprehending self-evidence and primacy of existence',
      'Analytical mastery of causality and cosmological order',
      'Preparation for advanced comparative metaphysics',
    ],
    keyBooks_fa: ['مبانی حکمت', 'بدایة الحکمة علامه طباطبایی', 'الشواهد الربوبیة ملاصدرا'],
    keyBooks_ar: ['مباني الحكمة', 'بداية الحكمة للعلامة الطباطبائي', 'الشواهد الربوبية لملا صدرا'],
    keyBooks_en: ['Fundamentals of Wisdom', 'Bidayat al-Hikmah', 'Al-Shawahid al-Rububiyyah'],
    sessionEstimate_fa: '۱۱۰ جلسه استودیویی',
    sessionEstimate_ar: '١١٠ درساً مسجلاً',
    sessionEstimate_en: '110 Studio Lectures',
    level_fa: 'متوسطه فلسفی',
    level_ar: 'المرحلة الفلسفية المتوسطة',
    level_en: 'Intermediate Philosophy',
    coursesList: [
      {
        title_fa: 'مبانی حکمت و هستی‌شناسی',
        title_ar: 'مباني الحكمة والأنطولوجيا',
        title_en: 'Foundations of Ontology',
        sessions_fa: '۱۸ جلسه',
        sessions_ar: '١٨ درساً',
        sessions_en: '18 Sessions',
        slug: 'mabani-hekmat',
      },
      {
        title_fa: 'بدایة الحکمة (دوره کامل)',
        title_ar: 'بداية الحكمة (دورة كاملة)',
        title_en: 'Bidayat al-Hikmah (Complete Course)',
        sessions_fa: '۳۵ جلسه',
        sessions_ar: '٣٥ درساً',
        sessions_en: '35 Sessions',
        slug: 'bedayat-al-hekmah',
      },
      {
        title_fa: 'بدایة الحکمة با رویکرد تفکر آزاد',
        title_ar: 'بداية الحكمة بمنهج التفكير الحر',
        title_en: 'Bidayat al-Hikmah Critical Dialogue',
        sessions_fa: '۱۵ جلسه',
        sessions_ar: '١٥ درساً',
        sessions_en: '15 Sessions',
        slug: 'bedayat-al-hekmah-azad',
      },
      {
        title_fa: 'الشواهد الربوبیة (سال اول و دوم)',
        title_ar: 'الشواهد الربوبية (السنة الأولى والثانية)',
        title_en: 'Al-Shawahid al-Rububiyyah (Years 1 & 2)',
        sessions_fa: '۴۲ جلسه',
        sessions_ar: '٤٢ درساً',
        sessions_en: '42 Sessions',
        slug: 'shawahed-al-rooboobiyah',
      },
    ],
  },
  {
    id: 'stage-3',
    stepNumber: 3,
    title_fa: 'اصول فقه و متدولوژی استنباط',
    title_ar: 'أصول الفقه ومنهجية الاستنباط',
    title_en: 'Legal Theory (Usul) & Hermeneutics of Ijtihad',
    category_fa: 'اصول',
    category_ar: 'الأصول',
    category_en: 'Legal Theory',
    subtitle_fa: 'قواعد استدلال تحلیلی در فقه و کشف احکام شرعی',
    subtitle_ar: 'قواعد الاستدلال التحليلي في الفقه واستنباط الأحكام الشرعية',
    subtitle_en: 'Rules of Analytical Inference and Jurisprudential Derivation',
    description_fa:
      'علم اصول فقه، شاهکار عقلانیت حقوقی و معرفت‌شناختی شیعه است. این مرحله به واکاوی مباحث قطع، ظن، حجیت خبر واحد، اصول عملیه (برائت، احتیاط، تخییر) و استصحاب می‌پردازد.',
    description_ar:
      'أصول الفقه يمثل ذروة العقلانية التشريعية والمعرفية الإمامية؛ يتناول دراسة مباحث القطع والظن، حجية الخبر، الأصول العملية والاستصحاب بدقة متناهية.',
    description_en:
      'Usul al-Fiqh embodies Islamic legal epistemology, dissecting certainty, probability, practical procedural principles (bara’ah, ihtiyad), and istishab.',
    outcomes_fa: [
      'تسلط بر ساختار مکتب اصولی شیخ اعظم انصاری و آخوند خراسانی',
      'کاربرد اصول عملیه در مواجهه با شبهات حکمیه و موضوعیه',
      'ورود مقتدرانه به ابحاث خارج فقه و اصول',
    ],
    outcomes_ar: [
      'الإحاطة بمدرسة الشيخ الأعظم الأنصاري والآخوند الخراساني',
      'تطبيق الأصول العملية في معالجة الشبهات الحكمية والموضوعية',
      'الاستعداد الكامل لبحوث الخارج الفقهية والأصولية',
    ],
    outcomes_en: [
      'Mastery of Ansari and Akhund Khorasani schools',
      'Application of procedural principles in normative doubts',
      'Fluency in post-graduate seminary legal methodology',
    ],
    keyBooks_fa: ['حلقة ثالثة شهید صدر', 'فرائد الاصول (رسائل)', 'کفایة الاصول'],
    keyBooks_ar: ['الحلقة الثالثة للشهيد الصدر', 'فرائد الأصول (الرسائل)', 'كفاية الأصول'],
    keyBooks_en: ['Halaqah Thalithah', 'Fara’id al-Usul (Rasa’il)', 'Kifayat al-Usul'],
    sessionEstimate_fa: '۱۴۰ جلسه استودیویی',
    sessionEstimate_ar: '١٤٠ درساً مسجلاً',
    sessionEstimate_en: '140 Studio Lectures',
    level_fa: 'سطوح عالی اجتهادی',
    level_ar: 'السطوح العالية الاجتهادية',
    level_en: 'Advanced Seminary Level',
    coursesList: [
      {
        title_fa: 'حلقه ثالثه (بخش اول)',
        title_ar: 'الحلقة الثالثة (القسم الأول)',
        title_en: 'Halaqah Thalithah (Part 1)',
        sessions_fa: '۱۸ جلسه',
        sessions_ar: '١٨ درساً',
        sessions_en: '18 Sessions',
        slug: 'halgheh-saleseh-1',
      },
      {
        title_fa: 'رسائل ۱ (مباحث قطع و ظن)',
        title_ar: 'الرسائل ١ (مباحث القطع والظن)',
        title_en: 'Rasa’il 1 (Certainty & Conjecture)',
        sessions_fa: '۲۵ جلسه',
        sessions_ar: '٢٥ درساً',
        sessions_en: '25 Sessions',
        slug: 'rasael-ghat-zan',
      },
      {
        title_fa: 'رسائل ۵ (شروط استصحاب)',
        title_ar: 'الرسائل ٥ (شروط الاستصحاب)',
        title_en: 'Rasa’il 5 (Istishab Conditions)',
        sessions_fa: '۲۲ جلسه',
        sessions_ar: '٢٢ درساً',
        sessions_en: '22 Sessions',
        slug: 'rasael-estashab',
      },
      {
        title_fa: 'کفایة الاصول جلد ۱ و ۲',
        title_ar: 'كفاية الأصول (المجلدان ١ و ٢)',
        title_en: 'Kifayat al-Usul (Vols 1 & 2)',
        sessions_fa: '۴۵ جلسه',
        sessions_ar: '٤٥ درساً',
        sessions_en: '45 Sessions',
        slug: 'kefayat-al-osul',
      },
    ],
  },
  {
    id: 'stage-4',
    stepNumber: 4,
    title_fa: 'حکمت متعالیه و فلسفه اشراق',
    title_ar: 'الحكمة المتعالية وفلسفة الإشراق',
    title_en: 'Transcendent Theosophy & Illuminationism',
    category_fa: 'فلسفه',
    category_ar: 'الفلسفة',
    category_en: 'Philosophy',
    subtitle_fa: 'اوج اندیشه فلسفی اسلامی و تطبیق انتقادی با فلسفه غرب',
    subtitle_ar: 'قمة الفكر الفلسفي الإسلامي والمقارنة النقدية مع الفلسفة الغربية',
    subtitle_en: 'Culmination of Islamic Philosophy & Critical Synthesis',
    description_fa:
      'در این تراز عالی، شاهکارهای تاریخ فلسفه بازخوانی می‌شوند: اسفار اربعه صدرالمتألهین با تمرکز بر حرکت جوهری، حدوث دهری و معاد جسمانی، در کنار انوار قاهره سهروردی و اشارات ابن‌سینا.',
    description_ar:
      'إعادة قراءة روائع التراث الفلسفي: الأسفار الأربعة لملا صدرا مع التركيز على الحركة الجوهرية والمعاد الجسماني، إلى جانب أنوار سهروردي وإشارات ابن سينا.',
    description_en:
      'Masterpieces of philosophical history examined at highest doctoral rigor: Mulla Sadra’s Asfar Arba’ah (substantial motion, bodily resurrection) alongside Suhrawardi’s Illuminationism.',
    outcomes_fa: [
      'احاطه بر دقائق اسفار اربعه و منظومه حکمی ملاصدرا',
      'تحلیل هندسه نوری نظام اشراقی شیخ شهاب‌الدین سهروردی',
      'تطبیق انتقادی اندیشه اسلامی با مکاتب فلسفه غرب',
    ],
    outcomes_ar: [
      'الإحاطة بدقائق الأسفار الأربعة ومنظومة ملا صدرا الحكيمة',
      'تحليل الهندسة النورية لمنهج الإشراق عند السهروردي',
      'المقارنة النقدية بين الحكمة الإسلامية ومدارس الفلسفة الغربية',
    ],
    outcomes_en: [
      'Comprehensive grasp of Mulla Sadra’s Asfar Arba’ah',
      'Geometric luminance analysis of Suhrawardi’s metaphysics',
      'Critical comparative engagement with modern Western thought',
    ],
    keyBooks_fa: ['الاسفار الاربعة', 'حکمت اشراق', 'الاشارات و التنبیهات نمط ۱۰', 'نهایة الحکمة'],
    keyBooks_ar: ['الأسفار الأربعة', 'حكمة الإشراق', 'الإشارات والتنبيهات (النمط ١٠)', 'نهاية الحكمة'],
    keyBooks_en: ['Al-Asfar al-Arba’ah', 'Hikmat al-Ishraq', 'Al-Isharat wa al-Tanbihat', 'Nihayat al-Hikmah'],
    sessionEstimate_fa: '۱۶۵ جلسه استودیویی',
    sessionEstimate_ar: '١٦٥ درساً مسجلاً',
    sessionEstimate_en: '165 Studio Lectures',
    level_fa: 'خارج فلسفه و حکمت',
    level_ar: 'البحث الخارج في الحكمة',
    level_en: 'Post-Doctoral Seminary Level',
    coursesList: [
      {
        title_fa: 'الاسفار الاربعة (سال اول و دوم)',
        title_ar: 'الأسفار الأربعة (السنة الأولى والثانية)',
        title_en: 'Al-Asfar al-Arba’ah (Years 1 & 2)',
        sessions_fa: '۵۰ جلسه',
        sessions_ar: '٥٠ درساً',
        sessions_en: '50 Sessions',
        slug: 'al-asfar-al-arbaah',
      },
      {
        title_fa: 'حکمت اشراق شیخ شهید سهروردی',
        title_ar: 'حكمة الإشراق لشيخ الإشراق السهروردي',
        title_en: 'Hikmat al-Ishraq by Suhrawardi',
        sessions_fa: '۲۸ جلسه',
        sessions_ar: '٢٨ درساً',
        sessions_en: '28 Sessions',
        slug: 'hekmat-al-ishraq',
      },
      {
        title_fa: 'الاشارات و التنبیهات (۱۰ نمط کامل)',
        title_ar: 'الإشارات والتنبيهات (١٠ أنماط كاملة)',
        title_en: 'Al-Isharat wa al-Tanbihat (10 Namats)',
        sessions_fa: '۳۴ جلسه',
        sessions_ar: '٣٤ درساً',
        sessions_en: '34 Sessions',
        slug: 'al-isharat',
      },
      {
        title_fa: 'نهایة الحکمة جلد ۱ و ۲',
        title_ar: 'نهاية الحكمة (المجلدان ١ و ٢)',
        title_en: 'Nihayat al-Hikmah (Vols 1 & 2)',
        sessions_fa: '۳۰ جلسه',
        sessions_ar: '٣٠ درساً',
        sessions_en: '30 Sessions',
        slug: 'nehayat-al-hekmah',
      },
      {
        title_fa: 'فلسفه غرب و نقد تطبیقی',
        title_ar: 'الفلسفة الغربية والنقد المقارن',
        title_en: 'Western Philosophy & Comparative Critique',
        sessions_fa: '۲۳ جلسه',
        sessions_ar: '٢٣ درساً',
        sessions_en: '23 Sessions',
        slug: 'falsafeh-gharb',
      },
    ],
  },
  {
    id: 'stage-5',
    stepNumber: 5,
    title_fa: 'عرفان نظری و شهود سلوکی',
    title_ar: 'العرفان النظري والشهود السلوكي',
    title_en: 'Theoretical Mysticism & Spiritual Realization',
    category_fa: 'عرفان',
    category_ar: 'العرفان',
    category_en: 'Irfan',
    subtitle_fa: 'وحدت وجود، اعیان ثابته و منازل لقاءالله',
    subtitle_ar: 'وحدة الوجود والأعيان الثابتة ومنازل السلوك',
    subtitle_en: 'Unity of Being, Fixed Entities, and Spiritual Stations',
    description_fa:
      'غایت القصوای سیر عقلانی، وصول به معرفت شهودی و بازخوانی متون عرفان ابن‌عربی است؛ تبیین نظری اسماء و صفات، مراتب تجلی، و تطبیق آن با سیر و سلوک عملی در منازل السائرین.',
    description_ar:
      'الغاية القصوى للسير العقلاني: بلوغ المعرفة الشهودية وقراءة متون مدرسة ابن عربي؛ تبيان الأسماء والصفات، مراتب التجلي ومنازل السلوك في منازل السائرين.',
    description_en:
      'The ultimate terminus of demonstrative inquiry: intuitive gnosis through Ibn Arabi’s school, exploring divine manifestations, immutable entities, and the hundred stations of Manazil al-Sa’irin.',
    outcomes_fa: [
      'فهم استدلالی وحدت شخصیه وجود و اعیان ثابته',
      'تسلط بر دقایق فصوص الحکم و شرح قیصری',
      'پیمودن نظری صد منزل سلوک الی الله',
    ],
    outcomes_ar: [
      'الفهم البرهاني للوحدة الشخصية للوجود والأعيان الثابتة',
      'الإحاطة التامة بفصوص الحكم وشرح القيصري',
      'استيعاب منازل السير والسلوك المائة نحو الله',
    ],
    outcomes_en: [
      'Demonstrative apprehension of ontological unity (Wahdat al-Wujud)',
      'Scholarly command of Fusus al-Hikam and Qaysari’s commentary',
      'Systematic navigation of the 100 spiritual stations',
    ],
    keyBooks_fa: ['تمهید القواعد ابن‌ترکه', 'مقدمه قیصری', 'فصوص الحکم', 'منازل السائرین'],
    keyBooks_ar: ['تمهيد القواعد لابن تركة', 'مقدمة القيصري', 'فصوص الحكم', 'منازل السائرين'],
    keyBooks_en: ['Tamhid al-Qawa’id', 'Muqaddimah of Qaysari', 'Fusus al-Hikam', 'Manazil al-Sa’irin'],
    sessionEstimate_fa: '۸۵ جلسه استودیویی',
    sessionEstimate_ar: '٨٥ درساً مسجلاً',
    sessionEstimate_en: '85 Studio Lectures',
    level_fa: 'خارج عرفان و معرفت',
    level_ar: 'البحث الخارج في العرفان',
    level_en: 'Advanced Irfan',
    coursesList: [
      {
        title_fa: 'مبانی عرفان نظری',
        title_ar: 'مباني العرفان النظري',
        title_en: 'Fundamentals of Theoretical Irfan',
        sessions_fa: '۱۲ جلسه',
        sessions_ar: '١٢ درساً',
        sessions_en: '12 Sessions',
        slug: 'mabani-erfan',
      },
      {
        title_fa: 'تمهید القواعد ابن‌ترکه',
        title_ar: 'تمهيد القواعد لابن تركة',
        title_en: 'Tamhid al-Qawa’id by Ibn Turkah',
        sessions_fa: '۲۴ جلسه',
        sessions_ar: '٢٤ درساً',
        sessions_en: '24 Sessions',
        slug: 'tamhid-al-ghawaed',
      },
      {
        title_fa: 'فصوص الحکم شیخ اکبر ابن‌عربی',
        title_ar: 'فصوص الحكم للشيخ الأكبر ابن عربي',
        title_en: 'Fusus al-Hikam by Ibn Arabi',
        sessions_fa: '۳۰ جلسه',
        sessions_ar: '٣٠ درساً',
        sessions_en: '30 Sessions',
        slug: 'fosoos-al-hekam',
      },
      {
        title_fa: 'منازل السائرین خواجه عبدالله انصاری',
        title_ar: 'منازل السائرين لخواجة عبد الله الأنصاري',
        title_en: 'Manazil al-Sa’irin by Ansari',
        sessions_fa: '۱۹ جلسه',
        sessions_ar: '١٩ درساً',
        sessions_en: '19 Sessions',
        slug: 'manazil-al-saerin',
      },
    ],
  },
];
