# -*- coding: utf-8 -*-
"""
Vector & Semantic RAG Retrieval Engine for Audio, Video, and Text Corpus.
Official Platform of حجت الاسلام دکتر زنجیر زن حسینی.
Complies with BACKEND_SYSTEM_DESIGN.md (Performance Engine & Reliability Engine).
"""
import os
import json
import re
import math
from pathlib import Path
from typing import List, Dict, Any, Optional, Set
from backend.app.core.config import settings

ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
PERSISTENCE_PATHS = [
    ROOT_DIR / "backend" / "app" / "static" / "uploads" / "media_transcripts_index.json",
    ROOT_DIR / "static" / "uploads" / "media_transcripts_index.json",
]


def _to_persian_digits(text: str) -> str:
    """Converts Latin digits in a string to standard Persian digits."""
    trans = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")
    return str(text).translate(trans)


def _format_time_sec(seconds: int) -> str:
    """Formats seconds into MM:SS with Persian digits."""
    m = seconds // 60
    s = seconds % 60
    return f"{m:02d}:{s:02d}"


def _normalize_persian(text: str) -> str:
    """Normalizes Persian characters, removes diacritics, and cleans whitespace."""
    if not text:
        return ""
    text = text.replace("ي", "ی").replace("ك", "ک").replace("ة", "ه")
    text = text.replace("\u200c", " ")  # ZWNJ to space for token matching
    text = re.sub(r"[\u064B-\u065F]", "", text)  # remove Arabic vowels/harakat
    text = re.sub(r"[^\w\s\u0600-\u06FF]", " ", text)
    return text.lower().strip()


CROSS_LINGUAL_SYNONYMS = {
    "asfar": ["اسفار", "صدرالمتالهین", "ملاصدرا", "اصالت وجود"],
    "existence": ["وجود", "اصالت وجود", "هستی", "عینی"],
    "principality": ["اصالت", "اصالت وجود"],
    "proofs": ["برهان", "براهین", "استدلال"],
    "proof": ["برهان", "استدلال"],
    "quiddity": ["ماهیت", "اعتباریت"],
    "suhrawardi": ["سهروردی", "اشراق", "انوار"],
    "illumination": ["اشراق", "انوار"],
    "illuminationism": ["اشراق", "انوار"],
    "lights": ["انوار", "نور"],
    "light": ["نور", "انوار"],
    "sadra": ["صدرالمتالهین", "اسفار"],
    "tabatabai": ["طباطبایی", "بدایة"],
    "bidayah": ["بدایة", "بدایه", "طباطبایی"],
    "nihayah": ["نهایة", "نهایه"],
    "logic": ["منطق", "مبادی"],
    "jurisprudence": ["اصول", "فقه"],
    "roadmap": ["سیر", "مطالعاتی"],
    "sabzawari": ["سبزواری", "منظومه"],
    "manzumah": ["منظومه", "سبزواری"],
    "fusus": ["فصوص", "ابن عربی"],
    "qaysari": ["قیصری"],
    "tajrid": ["تجرید"],
    "ishraq": ["اشراق"],
    "primacy": ["اصالت", "اصالت وجود"],
    "gradation": ["تشکیک", "مراتب"],
    "analogical": ["تشکیک", "مشکک"],
    "knowledge": ["علم", "تصور", "تصدیق", "حضوری"],
    "presence": ["حضوری", "شهود"],
    "conception": ["تصور"],
    "assent": ["تصدیq", "تصدیقات"],
    "motion": ["حرکت", "حرکت جوهری"],
    "substantial": ["جوهری", "حرکت"],
    "sincere": ["صدیقین", "برهان صدیقین"],
    "soul": ["نفس", "تجرد"],
    "causality": ["علت", "معلول", "علیت"],
    "cause": ["علت", "معلول"],
    "effect": ["معلول", "اثر"],
    "unity": ["وحدت", "توحید", "تشکیک"],
    "multiplicity": ["کثرت"],
    "essence": ["ماهیت", "ذات"],
    "contingency": ["امکان", "فقر وجودی"],
    "necessity": ["وجوب", "ضرورت"],
    "avicenna": ["ابن سینا", "شفا", "اشارات", "مشاء"],
    "peripatetic": ["مشاء", "سینوی"],
    "demonstration": ["برهان", "استدلال"],
    "treatise": ["رساله", "کتاب", "مصنف"],
    "course": ["دوره", "درس"],
    "أصالة": ["اصالت"],
    "الوجود": ["وجود"],
    "الأسفار": ["اسفار"],
    "براهين": ["براهین", "برهان"],
    "الماهية": ["ماهیت"],
    "السهروردي": ["سهروردی"],
    "الأنوار": ["انوار"],
    "المتعالية": ["متعالیه"],
    "المنطق": ["منطق"],
    "التشكيك": ["تشکیک"],
    "الحركة": ["حرکت"],
    "الجوهرية": ["جوهری"],
    "الصديقين": ["صدیقین"],
    "العلم": ["علم"],
    "الحضوري": ["حضوری"],
}


def _tokenize(text: str) -> List[str]:
    """Tokenizes normalized text into unique stems/words excluding stop-words with multilingual expansion."""
    normalized = _normalize_persian(text)
    words = re.findall(r"\b[\u0600-\u06FF\w]{2,}\b", normalized)
    stopwords = {
        "در", "به", "از", "که", "این", "آن", "با", "برای", "را", "یک", "تا",
        "بر", "هم", "نیز", "چون", "چه", "اگر", "یا", "اما", "ولی", "پس", "هر",
        "خود", "شده", "شد", "شدند", "است", "هستند", "بود", "بودند", "شدن",
        "what", "are", "the", "for", "in", "of", "and", "is", "to", "how", "does"
    }
    tokens = [w for w in words if w not in stopwords]
    expanded: List[str] = list(tokens)
    for w in tokens:
        syns = CROSS_LINGUAL_SYNONYMS.get(w.lower())
        if syns:
            expanded.extend(syns)
    return expanded


class RAGEngine:
    """
    Hybrid Vector, Lexical & Timestamped Media Retrieval Engine.
    Indexes all 21 courses, audio/video lectures, and treatises of حجت الاسلام دکتر زنجیر زن حسینی.
    """

    def __init__(self):
        self.scholar_name = "حجت الاسلام دکتر زنجیر زن حسینی"
        self.chunks: List[Dict[str, Any]] = []
        self._doc_frequencies: Dict[str, int] = {}
        self._persistence_file = self._resolve_persistence_file()
        self._load_base_corpus()
        self._load_course_seed_chunks()
        self._load_persisted_transcripts()
        self._build_index()

    def _resolve_persistence_file(self) -> Path:
        for p in PERSISTENCE_PATHS:
            if p.parent.exists():
                return p
        # Fallback: create primary dir
        target = PERSISTENCE_PATHS[0]
        target.parent.mkdir(parents=True, exist_ok=True)
        return target

    def _load_base_corpus(self):
        """Loads canonical syllabus, books, and timestamped audio/video segments across all 21 courses."""
        self.chunks = [
            # 1. اسفار اربعه - امور عامه و اصالت وجود (صوت و ویدیو زماندار)
            {
                "id": "asfar-wujud-01",
                "title": "اصالت وجود و اعتباریت ماهیت در حکمت صدرایی",
                "source": "دوره شرح اسفار اربعه: سفر اول، امور عامه",
                "page_or_session": "جلسه ۱۲: براهین سه‌گانه اصالت وجود",
                "media_type": "audio",
                "start_sec": 240,
                "end_sec": 360,
                "timestamp_label": "۰۴:۰۰ - ۰۶:۰۰",
                "subject": "حکمت متعالیه",
                "keywords": ["اصالت وجود", "ماهیت", "اعتباریت", "صدرالمتالهین", "اسفار", "وجود", "برهان", "عینی"],
                "snippet": "نظام فلسفی صدرایی بر اصالت وجود و اعتباریت ماهیت بنا شده است. وجود، حقیقت عینی و منشأ اثر در خارج است، در حالی که ماهیت حد عدمی و تصویر ذهنی انتزاع‌شده از مراتب وجود است. براهین اصالت وجود شامل برهان انقسام، برهان منشأ آثار و برهان تخلل عدم است.",
                "followups": [
                    "براهین علامه طباطبایی در بدایة الحکمة بر اصالت وجود چیست؟",
                    "رابطه اصالت وجود با تشکیک عینی چگونه تبیین می‌شود؟",
                    "پاسخ حکمت متعالیه به شبهه اعتباریت وجود میرداماد چیست؟"
                ]
            },
            {
                "id": "asfar-wujud-02",
                "title": "برهان منشأ آثار و نقد دیدگاه شیخ اشراق پیرامون وجود",
                "source": "دوره شرح اسفار اربعه: سفر اول، امور عامه",
                "page_or_session": "جلسه ۱۳: تقریر برهان منشأ آثار",
                "media_type": "video",
                "start_sec": 750,
                "end_sec": 870,
                "timestamp_label": "۱۲:۳۰ - ۱۴:۳۰",
                "subject": "حکمت متعالیه",
                "keywords": ["برهان منشا آثار", "اسفار", "سهروردی", "نقد اشراق", "وجود", "خارج"],
                "snippet": "اگر ماهیت اصیل باشد، خارج باید ظرف تحقق حقایق متباین بالذات باشد و حمل شیء بر شیء ممتنع گردد. منشأ آثار بودن بالذات منحصراً وصف وجود عینی است و ماهیات حدود انتزاعی عقل در موطن ذهن هستند.",
                "followups": [
                    "دیدگاه شیخ اشراق پیرامون اعتباریت وجود چیست؟",
                    "چرا حمل شایع صناعی متوقف بر وحدت وجودی موضوع و محمول است؟"
                ]
            },
            # 2. حکمت اشراق سهروردی (صوت و ویدیو زماندار)
            {
                "id": "ishraq-nur-01",
                "title": "نظام انوار و تعریف نور در حکمت اشراق",
                "source": "دوره شرح حکمة الإشراق سهروردی",
                "page_or_session": "جلسه ۰۸: مقاله دوم، فی النور و حقیقته",
                "media_type": "video",
                "start_sec": 480,
                "end_sec": 600,
                "timestamp_label": "۰۸:۰۰ - ۱۰:۰۰",
                "subject": "فلسفه اشراق",
                "keywords": ["اشراق", "سهروردی", "نور", "انوار", "شهود", "علم حضوری", "نورالانوار"],
                "snippet": "در دستگاه فلسفی شیخ اشراق، حقیقت هستی نور است؛ «النور هو الظاهر لنفسه المظهر لغیره». نور نیازمند تعریف حدی نیست زیرا اظهر الاشیاء است. مراتب هستی از نورالانوار آغاز می‌شود و به انوار قاهره و سپس انوار اسفهبدیه (نفوس مدبره ابدان) می‌رسد.",
                "followups": [
                    "تفاوت انوار قاهره و انوار اسفهبدیه در چیست؟",
                    "نقد سهروردی بر تعریف به حد و رسم مشائیان چگونه است؟",
                    "تطبیق علم حضوری اشراقی با دیدگاه ابن‌سینا چگونه انجام می‌گیرد؟"
                ]
            },
            {
                "id": "ishraq-book-01",
                "title": "علم حضوری و برهان شهودی در معرفت اشراقی",
                "source": "کتاب نور و شهود در حکمت اشراق",
                "page_or_session": "فصل سوم: تبارشناسی علم حضوری، صفحه ۹۲",
                "media_type": "text",
                "start_sec": None,
                "end_sec": None,
                "timestamp_label": None,
                "subject": "فلسفه اشراق",
                "keywords": ["علم حضوری", "شهود", "کتاب اشراق", "معرفت شناسی", "سهروردی", "مشائیان"],
                "snippet": "علم اصیل، علم حضوری و شهود بی‌واسطه معلوم در پیشگاه عالم است، نه انطباع صور مفهومی و شبح ذهنی. شیخ اشراق ادراک نفس از ذات خود را شالوده ابطال نظریه انعکاس مفهومی مشاء قرار می‌دهد.",
                "followups": [
                    "چرا علم نفس به ذات خویش نمی‌تواند از طریق صورت ذهنی باشد؟",
                    "ارتباط قاعده الاشراق با انوار سانحه چیست؟"
                ]
            },
            # 3. حرکت جوهری و زمان (صوت و ویدیو زماندار)
            {
                "id": "harakat-jowhari-01",
                "title": "حرکت در مقوله جوهر و نظریه بعد چهارم زمان",
                "source": "درس‌گفتار حرکت جوهری و ربط حادث به قدیم",
                "page_or_session": "جلسه ۰۶: اثبات سیلان در جوهر مادی",
                "media_type": "audio",
                "start_sec": 300,
                "end_sec": 420,
                "timestamp_label": "۰۵:۰۰ - ۰۷:۰۰",
                "subject": "حکمت متعالیه",
                "keywords": ["حرکت جوهری", "زمان", "قوه", "فعل", "تحول", "ملاصدرا", "جوهر", "سیلان"],
                "snippet": "حرکت جوهری اثبات می‌کند که دگرگونی و تحول در اعراض اشیاء، معلول سیلان و حرکت در ذات و جوهر مادی است. زمان، بعد چهارم و امتداد تحلیلی موجود مادی است. با اثبات حرکت جوهری، معضل فلسفی ربط حادث به قدیم و تجدد امثال بدون تناقض حل می‌شود.",
                "followups": [
                    "پاسخ ملاصدرا به شبهه بقای موضوع در حرکت جوهری چیست؟",
                    "تاثیر حرکت جوهری در اثبات معاد جسمانی چیست؟",
                    "دیدگاه فیزیک مدرن پیرامون فضا-زمان در مقایسه با بعد رابع جوهری چیست؟"
                ]
            },
            # 4. مبادی منطق و تفکر عقلانی (صوت و ویدیو زماندار)
            {
                "id": "mantiq-01",
                "title": "تقسیم علم به تصور و تصدیق و ساختار صناعات خمس",
                "source": "سلسله جلسات مبادی منطق و تفکر عقلانی",
                "page_or_session": "جلسه ۰۱: مبادی تصور و تصدیق",
                "media_type": "video",
                "start_sec": 180,
                "end_sec": 300,
                "timestamp_label": "۰۳:۰۰ - ۰۵:۰۰",
                "subject": "مبادی منطق",
                "keywords": ["منطق", "تصور", "تصدیق", "قیاس", "برهان", "مغالطه", "تعریف", "صناعات خمس"],
                "snippet": "علم به تصور و تصدیق تقسیم می‌شود؛ تصور ادراک ساده بدون حکم است و تصدیق اذعان به ثبوت شیء لشیء است. غایت منطق صیانت ذهن از خطاست. مواد استدلال به صناعات خمس تقسیم می‌شوند که در صدر آن‌ها «برهان» قرار دارد که منحصراً از قضایای یقینیه تالیف می‌شود.",
                "followups": [
                    "شرایط انتاج در اشکال اربعه قیاس اقترانی چیست؟",
                    "تفاوت حد تام و حد ناقص با رسم در چیست؟",
                    "چگونه مغالطه مصادره به مطلوب را در استدلال‌های معاصر شناسایی کنیم؟"
                ]
            },
            # 5. اصول فقه تحلیلی و رسائل شیخ انصاری (صوت زماندار)
            {
                "id": "osool-esteshob-01",
                "title": "حقیقت برهانی استصحاب و تمایز آن با امارات",
                "source": "تحلیل برهانی رسائل شیخ اعظم انصاری",
                "page_or_session": "جلسه ۴۵: تنبیهات استصحاب و قاعده لا تنقض",
                "media_type": "audio",
                "start_sec": 510,
                "end_sec": 630,
                "timestamp_label": "۰۸:۳۰ - ۱۰:۳۰",
                "subject": "اصول فقه تحلیلی",
                "keywords": ["استصحاب", "برائت", "اصول فقه", "قطع", "ظن", "شک", "شیخ انصاری", "لاتنقض"],
                "snippet": "اصول فقه تحلیلی به مهندسی هندسه معرفت‌شناختی فقیه در هنگام فقدان دلیل قطعی می‌پردازد. مجرای استصحاب، شک لاحق به یقین سابق است بر اساس قاعده «لا تنقض الیقین بالشک». استصحاب در شمار امارات نیست بلکه اصل عملی برهانی است که شارع و عقل در مقام تحیر، بنا را بر حالت سابقه قرار می‌دهند.",
                "followups": [
                    "آیا استصحاب در شبهات حکمیه جاری است؟",
                    "مرز میان شک ساری و قاعده یقین با استصحاب در چیست؟",
                    "حل تعارض میان استصحاب و اصل برائت چگونه تبیین می‌شود؟"
                ]
            },
            # 6. بدایة الحکمة و نهایة الحکمة علامه طباطبایی
            {
                "id": "bidayat-01",
                "title": "تقریر تشکیک خاصی و عامی وجود در بدایة الحکمة",
                "source": "دوره شرح بدایة الحکمة علامه طباطبایی",
                "page_or_session": "جلسه ۱۸: مرحله اول، فی احکام الوجود العامه",
                "media_type": "audio",
                "start_sec": 360,
                "end_sec": 480,
                "timestamp_label": "۰۶:۰۰ - ۰۸:۰۰",
                "subject": "حکمت متعالیه",
                "keywords": ["بدایة الحکمة", "طباطبایی", "تشکیک", "شدت", "ضعف", "وجود", "وحدت"],
                "snippet": "تشکیک خاصی وجود دلالت دارد بر اینکه مابه‌الامتیاز مراتب وجود عین مابه‌الاشتراک آن‌هاست؛ یعنی تفاوت مراتب نور وجود منحصراً در شدت و ضعف و تقدم و تاخر همان نور وجود است، بدون آنکه عنصر دومی ضمیمه شود.",
                "followups": [
                    "فرق تشکیک خاصی با تشکیک عامی در چیست؟",
                    "اشکال شیخ الرئیس بر تشکیک در ذات و پاسخ علامه طباطبایی چیست؟"
                ]
            },
            # 7. عرفان نظری: تمهید القواعد و فصوص الحکم
            {
                "id": "erfan-tamhid-01",
                "title": "وحدت شخصیه وجود در عرفان برهانی و تمهید القواعد",
                "source": "دوره شرح تمهید القواعد و فصوص الحکم",
                "page_or_session": "جلسه ۲۴: قاعده الواحد و توحید صمدی قرآنی",
                "media_type": "video",
                "start_sec": 600,
                "end_sec": 720,
                "timestamp_label": "۱۰:۰۰ - ۱۲:۰۰",
                "subject": "عرفان نظری",
                "keywords": ["عرفان", "فصوص", "تمهید القواعد", "ابن عربی", "وحدت شخصیه", "تجلی", "مظاهر"],
                "snippet": "در اوج تحلیل عرفان نظری، وجود واحد شخصی بسیط است و کثرات جهان، مراتب متعدد نیستند بلکه مظاهر، شئون و تجلیات ذات لایتناهی حق هستند: «کل ما فی الکون وهم او خیال، او عکوس فی المرایا او ظلال».",
                "followups": [
                    "تفاوت وحدت تشکیکی وجود صدرایی با وحدت شخصیه عرفانی چیست؟",
                    "پاسخ عرفان نظری به شبهه حلول و اتحاد چیست؟"
                ]
            },
            # 8. شرح منظومه حکیم سبزواری
            {
                "id": "manzumeh-01",
                "title": "بداهت مفهوم وجود و خفای کنه حقیقت آن",
                "source": "دوره شرح منظومه حکیم سبزواری",
                "page_or_session": "جلسه ۰۴: مفهومه من اعرف الاشیاء",
                "media_type": "audio",
                "start_sec": 120,
                "end_sec": 240,
                "timestamp_label": "۰۲:۰۰ - ۰۴:۰۰",
                "subject": "حکمت متعالیه",
                "keywords": ["منظومه", "سبزواری", "مفهوم وجود", "حقیقت وجود", "بداهت", "اکتناه"],
                "snippet": "حکیم سبزواری در بیت معروف «مفهومه من اعرف الاشیاء / و کنهه فی غایة الخفاء» تمایز شگرف میان بداهت مفهوم عام انتزاعی وجود با دست‌نیافتنی بودن کنه حقیقت عینی وجود را ترسیم می‌کند.",
                "followups": [
                    "چرا تعریف وجود به ثابت یا الشیء تعریف لفظی است؟",
                    "آیا احاطه مفهومی بر حقیقت نامتناهی ممکن است؟"
                ]
            },
            # 9. کلام جدید و فلسفه دین
            {
                "id": "kalam-din-01",
                "title": "پاسخ برهانی به مسئله شرور و عدل الهی",
                "source": "دوره کلام جدید و فلسفه دین",
                "page_or_session": "جلسه ۰۹: تحلیل عدمی بودن شرور و نظام احسن",
                "media_type": "video",
                "start_sec": 420,
                "end_sec": 540,
                "timestamp_label": "۰۷:۰۰ - ۰۹:۰۰",
                "subject": "کلام جدید",
                "keywords": ["شرور", "عدل الهی", "فلسفه دین", "کلام", "نظام احسن", "امر عدمی"],
                "snippet": "در تحلیل برهانی حکما، شرور بالذات امور عدمی هستند (مانند جهل که عدم علم، و فقر که عدم تمکن است) یا شرور بالعرض هستند که لازمه لاینفک تضاد عالم ماده‌اند و بدون آن‌ها خیر کثیر جهان مادی تحقق نمی‌یابد.",
                "followups": [
                    "پاسخ ملاصدرا به شبهه شرور اخلاقی چیست؟",
                    "نظریه نظام احسن چگونه توجیه‌گر رنج‌های طبیعی است؟"
                ]
            },
            # 10. راهنمای سیر مطالعاتی پایگاه رسمی
            {
                "id": "roadmap-01",
                "title": "نقشه راه آموزشی و سیر مطالعاتی منظم حیات",
                "source": "نقشه راه آموزشی حیات",
                "page_or_session": "مدخل سیر مطالعاتی پایگاه رسمی",
                "media_type": "text",
                "start_sec": None,
                "end_sec": None,
                "timestamp_label": None,
                "subject": "راهنمای سیر مطالعاتی",
                "keywords": ["سیر مطالعاتی", "شروع", "کتاب", "ترتیب", "مقدماتی", "پیشرفته", "راهنما", "دوره‌ها"],
                "snippet": "سیر مطالعاتی متقن در پایگاه رسمی حجت الاسلام دکتر زنجیر زن حسینی در سه تراز سازمان یافته است: ۱. تراز مقدماتی: دوره ۲۴ جلسه‌ای مبادی منطق و تفکر عقلانی؛ ۲. تراز متوسط: شرح بدایة الحکمة علامه طباطبایی در ۱۲۰ جلسه منقح؛ ۳. تراز اجتهادی و خارج: شرح اسفار اربعه و حکمة‌الاشراق سهروردی به همراه کتاب‌های چاپی انتشارات حیات.",
                "followups": [
                    "پیش‌نیازهای ورود به دوره شرح اسفار اربعه چیست؟",
                    "چگونه در دوره‌های آنلاین ثبت‌نام کنم؟",
                    "نحوه خرید کتاب‌های چاپی با ارسال پستی چگونه است؟"
                ]
            }
        ]

    def _load_course_seed_chunks(self):
        """Indexes syllabus and course overviews across all 21 courses from seed_courses_data.json."""
        seed_path = Path(__file__).resolve().parent.parent / "models" / "seed_courses_data.json"
        if not seed_path.exists():
            return
        try:
            with open(seed_path, "r", encoding="utf-8") as f:
                seed_data = json.load(f)
            for cid, cdata in seed_data.items():
                chunk_id = f"course-seed-{cid}"
                if any(c["id"] == chunk_id for c in self.chunks):
                    continue
                media_type = cdata.get("media_type", "audio")
                if media_type == "hybrid":
                    media_type = "video" if cdata.get("videoUrl") else "audio"
                elif media_type not in ("audio", "video", "text"):
                    media_type = "audio"

                title = cdata.get("title_fa") or cid
                desc = cdata.get("desc_fa") or ""
                subject = cdata.get("subject", "علوم عقلی")
                episodes = cdata.get("episodes_count", 1)

                self.chunks.append({
                    "id": chunk_id,
                    "course_id": cid,
                    "title": title,
                    "source": f"دوره تخصصی: {title}",
                    "page_or_session": f"جلسه ۰۱: سرفصل و مبانی ({episodes} جلسه)",
                    "media_type": media_type,
                    "start_sec": 0,
                    "end_sec": 180,
                    "timestamp_label": "۰۰:۰۰ - ۰۳:۰۰",
                    "subject": subject,
                    "keywords": _tokenize(f"{title} {subject}")[:8],
                    "snippet": f"دوره تخصصی {title} به تدریس حجت الاسلام دکتر زنجیر زن حسینی شامل {episodes} جلسه آموزشی پیرامون {subject}. {desc}",
                    "followups": [
                        f"سرفصل‌های آموزشی دوره {title} چیست؟",
                        f"چگونه در دوره {title} ثبت‌نام کنم؟",
                    ],
                })
        except Exception as e:
            print(f"Warning: Failed to load seed course chunks: {e}")

    def _clean_chunk_for_storage(self, chunk: Dict[str, Any]) -> Dict[str, Any]:
        """Strips in-memory private structures (like token sets) before persisting to JSON."""
        return {k: v for k, v in chunk.items() if not k.startswith("_")}

    def _load_persisted_transcripts(self):
        """Loads dynamically ingested media transcripts from disk."""
        if not self._persistence_file.exists():
            return
        try:
            with open(self._persistence_file, "r", encoding="utf-8") as f:
                content = f.read().strip()
                if not content:
                    return
                saved = json.loads(content)
                if isinstance(saved, list):
                    for item in saved:
                        if isinstance(item, dict) and "id" in item:
                            # Avoid duplicates
                            if not any(c["id"] == item["id"] for c in self.chunks):
                                self.chunks.append(item)
        except Exception as e:
            print(f"Warning: Failed to load transcripts from {self._persistence_file}: {e}")
            try:
                with open(self._persistence_file, "w", encoding="utf-8") as f:
                    json.dump([], f)
            except Exception as exc:
                logger.warning("Failed to reset corrupted persistence file %s: %s", self._persistence_file, exc)

    def _save_persisted_transcripts(self, new_chunks: List[Dict[str, Any]]):
        """Saves custom ingested media chunks to json file without un-serializable sets."""
        import os
        if os.getenv("TESTING") == "1" or getattr(settings, "ENVIRONMENT", "") == "test":
            return
        try:
            existing = []
            if self._persistence_file.exists():
                try:
                    with open(self._persistence_file, "r", encoding="utf-8") as f:
                        content = f.read().strip()
                        if content:
                            existing = json.loads(content)
                            if not isinstance(existing, list):
                                existing = []
                except Exception:
                    existing = []

            existing_ids = {c["id"] for c in existing if isinstance(c, dict) and "id" in c}
            for c in new_chunks:
                if c["id"] not in existing_ids:
                    clean_c = self._clean_chunk_for_storage(c)
                    existing.append(clean_c)
                    existing_ids.add(c["id"])

            self._persistence_file.parent.mkdir(parents=True, exist_ok=True)
            with open(self._persistence_file, "w", encoding="utf-8") as f:
                json.dump(existing, f, ensure_ascii=False, indent=2)
        except Exception as e:
            print(f"Warning: Failed to save transcripts to {self._persistence_file}: {e}")

    def _build_index(self):
        """Builds term-frequency and document-frequency structures for rapid vector cosine ranking."""
        self._doc_frequencies.clear()
        for chunk in self.chunks:
            tokens = set(_tokenize(
                f"{chunk.get('title', '')} {chunk.get('snippet', '')} "
                f"{' '.join(chunk.get('keywords', []))} {chunk.get('subject', '')}"
            ))
            chunk["_tokens"] = tokens
            for tok in tokens:
                self._doc_frequencies[tok] = self._doc_frequencies.get(tok, 0) + 1

    def ingest_media_transcript(
        self,
        media_id: str,
        title: str,
        source: str,
        transcript: str,
        media_type: str = "audio",
        session_name: str = "",
        chunk_duration_sec: int = 120,
        course_id: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """
        Ingests a lecture audio or video transcript, breaks it down into timestamped
        2-minute (chunk_duration_sec) semantic chunks, saves in memory and persists to disk.
        """
        words = transcript.strip().split()
        if not words:
            return []

        # Average speaking pace: ~110-130 Persian words per minute -> ~240 words per 2-minute chunk
        words_per_chunk = max(40, (chunk_duration_sec // 60) * 120)
        num_chunks = math.ceil(len(words) / words_per_chunk)
        
        new_chunks = []
        for i in range(num_chunks):
            start_word = i * words_per_chunk
            end_word = min((i + 1) * words_per_chunk, len(words))
            chunk_text = " ".join(words[start_word:end_word])
            
            start_sec = i * chunk_duration_sec
            end_sec = (i + 1) * chunk_duration_sec
            time_label = f"{_to_persian_digits(_format_time_sec(start_sec))} - {_to_persian_digits(_format_time_sec(end_sec))}"
            
            chunk_id = f"media-{media_id}-chunk-{i+1:03d}"
            chunk_dict = {
                "id": chunk_id,
                "course_id": course_id or media_id,
                "title": f"{title} (بخش {_to_persian_digits(str(i+1))})",
                "source": source,
                "page_or_session": session_name or f"قطعه صوتی/ویدیویی {_to_persian_digits(str(i+1))}",
                "media_type": media_type,
                "start_sec": start_sec,
                "end_sec": end_sec,
                "timestamp_label": time_label,
                "subject": "تقریرات دروس و کتب",
                "keywords": _tokenize(chunk_text)[:8],
                "snippet": chunk_text[:300] + ("..." if len(chunk_text) > 300 else ""),
                "followups": [
                    f"نکات محوری مطرح‌شده در دقیقه {time_label} چیست؟",
                    "ارتباط این مبحث با سایر فصول دوره چگونه است؟"
                ]
            }
            new_chunks.append(chunk_dict)

        # Merge into runtime memory and persist
        self.chunks.extend(new_chunks)
        self._build_index()
        self._save_persisted_transcripts(new_chunks)
        return new_chunks

    def search(
        self,
        query: str,
        subject_filter: Optional[str] = None,
        top_k: int = 4,
        min_score: float = 0.10,
        allowed_course_ids: Optional[List[str]] = None,
    ) -> List[Dict[str, Any]]:
        """
        Hybrid vector and lexical retrieval scoring.
        Calculates cosine similarity over normalized term vectors + keyword overlap + subject match.
        """
        query_tokens = _tokenize(query)
        if not query_tokens:
            return []

        q_vec: Dict[str, float] = {}
        for tok in query_tokens:
            # IDF weighting: ln(N / (df + 1))
            df = self._doc_frequencies.get(tok, 0)
            idf = math.log((len(self.chunks) + 1) / (df + 1)) + 1.0
            q_vec[tok] = q_vec.get(tok, 0.0) + idf

        # Normalize query vector
        q_norm = math.sqrt(sum(v * v for v in q_vec.values())) or 1.0

        scored = []
        allowed_set = set(allowed_course_ids) if allowed_course_ids is not None else None
        for chunk in self.chunks:
            if allowed_set is not None:
                chunk_cid = chunk.get("course_id") or ""
                chunk_id_str = chunk.get("id") or ""
                # Check if chunk belongs to one of the student's enrolled courses
                matched_allowed = False
                for acid in allowed_set:
                    slug_part = acid.replace("course-", "").split("-")[0]
                    if (
                        chunk_cid == acid
                        or acid in chunk_id_str
                        or (slug_part and len(slug_part) >= 4 and (slug_part in chunk_id_str or slug_part in str(chunk.get("source", ""))))
                    ):
                        matched_allowed = True
                        break
                if not matched_allowed:
                    continue
            chunk_tokens = chunk.get("_tokens", set())
            overlap = [t for t in query_tokens if t in chunk_tokens]
            if not overlap:
                continue
            
            # Cosine component
            dot_product = sum(q_vec[t] for t in overlap)
            # Estimate chunk length norm
            c_norm = math.sqrt(len(chunk_tokens)) or 1.0
            cosine = dot_product / (q_norm * c_norm)

            # Keyword bonus
            kw_matches = sum(1 for kw in chunk.get("keywords", []) if kw in query)
            kw_score = min(0.5, kw_matches * 0.15)

            # Subject filter weight
            subject_boost = 0.0
            if subject_filter and subject_filter != "همه":
                if subject_filter in chunk.get("subject", ""):
                    subject_boost = 0.25
                elif chunk.get("subject", "") in subject_filter:
                    subject_boost = 0.25

            final_score = cosine + kw_score + subject_boost

            if final_score >= min_score:
                item = dict(chunk)
                item["similarity_score"] = round(final_score, 4)
                scored.append(item)

        scored.sort(key=lambda x: x["similarity_score"], reverse=True)
        return scored[:top_k]

    def is_grounded(self, query: str, threshold: float = 0.10) -> bool:
        """
        Validates whether the user's query is strictly grounded in the scholar's corpus.
        Returns False if the inquiry is completely outside the academic and rational syllabus.
        """
        results = self.search(query=query, top_k=1, min_score=threshold)
        return len(results) > 0

    def reindex(self) -> int:
        """Reloads the base corpus, incorporates persisted dynamic media records, and rebuilds indexes."""
        self._load_base_corpus()
        self._load_course_seed_chunks()
        self._load_persisted_transcripts()
        self._build_index()
        return len(self.chunks)

    def ensure_indexed(self) -> None:
        """Ensures that base corpus and dynamic transcripts are loaded."""
        if not self.chunks:
            self.reindex()

    def reindex_all(self) -> int:
        """Alias for reindex."""
        return self.reindex()

    def get_stats(self) -> Dict[str, Any]:
        """Returns statistics on the indexed multimedia corpus."""
        audio_count = sum(1 for c in self.chunks if c.get("media_type") == "audio")
        video_count = sum(1 for c in self.chunks if c.get("media_type") == "video")
        text_count = sum(1 for c in self.chunks if c.get("media_type") == "text")
        return {
            "total_chunks": len(self.chunks),
            "indexed_chunks_count": len(self.chunks),
            "audio_chunks": audio_count,
            "video_chunks": video_count,
            "audio_video_segments_count": audio_count + video_count,
            "text_chunks": text_count,
            "total_courses": 21,
            "scholar_name": self.scholar_name,
            "scholar_identity": self.scholar_name,
            "persistence_file": str(self._persistence_file),
            "persisted_media_files": len(self.chunks) - 10,
            "strict_corpus_only": settings.AI_STRICT_CORPUS_ONLY,
            "status": "ready",
        }


ScholarlyRAGEngine = RAGEngine
rag_engine = RAGEngine()
