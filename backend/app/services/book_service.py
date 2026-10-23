"""
Book and E-Reader Service.
Provides book catalog and Fidibo/Taaghche inspired sample reader spreads.
"""
from typing import List, Dict, Any
from backend.app.core.exceptions import EntityNotFoundException


class BookService:
    def __init__(self):
        self.books: List[Dict[str, Any]] = [
            {
                "id": "book-ishraq-1",
                "title": "نور و شهود در حکمت اشراق سهروردی",
                "subtitle": "بررسی تطبیقی معرفت‌شناسی اشراقی با فنومنولوژی معاصر",
                "author": "حجت الاسلام دکتر زنجیر زن حسینی",
                "publisher": "انتشارات حکمت و فلسفه اسلامی",
                "print_edition": "چاپ سوم (جلد سخت گالینگور)",
                "pages_count": 480,
                "isbn": "978-600-1234-56-7",
                "price": "۳۲۰,۰۰۰",
                "physical_price": "۳۹۰,۰۰۰",
                "format": "نسخه دیجیتال (E-Book) و نسخه چاپی نفیس",
                "cover_image": "/images/book_cover_real.jpg",
                "sample_pdf_url": "/sample-books/ishraq-sample.pdf",
                "fidibo_reader_url": "/reader/book-ishraq-1",
                "synopsis": "این اثر پژوهشی مرجع در تبیین دقیق نظریه علم حضوری و انوار اسپهبدیه در دستگاه فلسفی شیخ اشراق است. کتاب با تحلیل ریشه‌های باستانی حکمت خسروانی و تطبیق آن با رویکرد پدیدارشناختی هایدگر و مرلو-پونتی، خوانشی نوین از مکتب اشراق ارائه می‌دهد.",
                "table_of_contents": [
                    {"id": 1, "title": "مقدمه استاد و سرآغاز بحث در حکمت ذوقی", "page_number": 15},
                    {"id": 2, "title": "فصل اول: ماهیت نور و نقد نظریه انطباع مشائی", "page_number": 45},
                    {"id": 3, "title": "فصل دوم: مراتب انوار مجرده و انوار عارضه", "page_number": 110},
                    {"id": 4, "title": "فصل سوم: قاعده امکان اشرف و صدور کثرت", "page_number": 185},
                    {"id": 5, "title": "فصل چهارم: علم حضوری، شهود نفس و اشراق باطن", "page_number": 260},
                    {"id": 6, "title": "فصل پنجم: تطبیق پدیدارشناسی هوسرل و هایدگر با ادراک اشراقی", "page_number": 340},
                    {"id": 7, "title": "خاتمه: بازتاب حکمت اشراق در تمدن اندلس و فلسفه غرب", "page_number": 430}
                ],
                "sample_reading": [
                    {
                        "page_number": 1,
                        "title": "صفحه اول - دیباچه کتاب",
                        "excerpt": "بسم الله النور. حقیقت وجود، نوری است ساطع که ظلمت عدم را به پرتو فیض خویش می‌شکافد. شیخ شهاب‌الدین یحیی بن حبش سهروردی در سرآغاز حکمة‌الاشراق، تفکر فلسفی را از قید مفاهیم خشک منطق صوری آزاد ساخته و معرفت را بر پایه مشاهده مستقیم و حضور نور در برابر مدرِک بنا نهاد.",
                        "is_locked": False
                    },
                    {
                        "page_number": 2,
                        "title": "صفحه دوم - تمایز حکمت بحثی و حکمت ذوقی",
                        "excerpt": "سهروردی حکما را به چهار طبقه بنیادین تقسیم می‌کند: نخست، حکیم الهی متأله که در شهود و تأله به کمال رسیده اما در بحث و استدلال رسمی ضعیف است. دوم، حکیم بحثی که در استدلال قوی اما از اشراق باطن بی‌بهره است...",
                        "is_locked": False
                    },
                    {
                        "page_number": 3,
                        "title": "صفحه سوم - تعریف نور در دستگاه اشراقی",
                        "excerpt": "«النور هو الظاهر لنفسه المظهر لغیره». هیچ تعریفی از نور رساتر از این عبارت نیست. نور چیزی نیست که به واسطه غیر خود شناخته شود؛ بلکه هر چه شناخته می‌شود، در روشنایی نور آشکار می‌شود. بنابراین نور بی‌نیاز از تعریف حدّی و رسمی است.",
                        "is_locked": False
                    },
                    {
                        "page_number": 4,
                        "title": "صفحه چهارم - صفحات اختصاصی نسخه کامل",
                        "excerpt": "این بخش از کتاب و سرفصل‌های تخصصی فصول دوم تا پنجم منحصراً در نسخه کامل چاپی و الکترونیکی در دسترس است. جهت مطالعه کامل اثر، لطفاً سفارش خود را از طریق سبد خرید نهایی فرمایید.",
                        "is_locked": True
                    }
                ]
            },
            {
                "id": "book-bidayat",
                "title": "کتاب بدایة الحکمة",
                "subtitle": "متن و یادداشت‌های تحلیلی بر کتاب بدایة الحکمة",
                "author": "حجت الاسلام دکتر زنجیر زن حسینی",
                "publisher": "انتشارات حکمت و فلسفه اسلامی",
                "print_edition": "چاپ دوم",
                "pages_count": 320,
                "isbn": "978-600-1234-58-1",
                "price": "۱۲۰,۰۰۰",
                "physical_price": "۱۸۰,۰۰۰",
                "format": "نسخه چاپی و دیجیتال",
                "cover_image": "/images/book_cover_real.jpg",
                "sample_pdf_url": "/sample-books/bidayat-sample.pdf",
                "fidibo_reader_url": "/reader/book-bidayat",
                "synopsis": "تحلیل گام‌به‌گام مراحل فلسفه اسلامی بر مبنای اندیشه علامه طباطبایی با تدریس حجت الاسلام دکتر زنجیر زن حسینی.",
                "table_of_contents": [],
                "sample_reading": []
            },
            {
                "id": "book-bidayat-pdf",
                "title": "کتاب الکترونیکی بدایه",
                "subtitle": "نسخه دیجیتال (الکترونیکی) متن آموزشی بدایة الحکمة",
                "author": "حجت الاسلام دکتر زنجیر زن حسینی",
                "publisher": "انتشارات حکمت و فلسفه اسلامی",
                "print_edition": "نسخه دیجیتال",
                "pages_count": 320,
                "isbn": "978-600-1234-59-8",
                "price": "۵۰,۰۰۰",
                "physical_price": "۵۰,۰۰۰",
                "format": "نسخه دیجیتال (E-Book)",
                "cover_image": "/images/book_cover_real.jpg",
                "sample_pdf_url": "/sample-books/bidayat-pdf-sample.pdf",
                "fidibo_reader_url": "/reader/book-bidayat-pdf",
                "synopsis": "نسخه دیجیتال کتاب بدایة الحکمة همراه با متن منقح آموزشی.",
                "table_of_contents": [],
                "sample_reading": []
            },
            {
                "id": "book-hekmat-vol1",
                "title": "کتاب چاپی حکمت جلد ۱",
                "subtitle": "مجموعه مقالات و درس‌های فلسفه و حکمت اسلامی",
                "author": "حجت الاسلام دکتر زنجیر زن حسینی",
                "publisher": "انتشارات حکمت و فلسفه اسلامی",
                "print_edition": "چاپ اول",
                "pages_count": 410,
                "isbn": "978-600-1234-60-4",
                "price": "۱۵۰,۰۰۰",
                "physical_price": "۲۰۰,۰۰۰",
                "format": "نسخه چاپی گالینگور",
                "cover_image": "/images/book_cover_real.jpg",
                "sample_pdf_url": "/sample-books/hekmat-vol1-sample.pdf",
                "fidibo_reader_url": "/reader/book-hekmat-vol1",
                "synopsis": "مجموعه مقالات فلسفی و هستی‌شناسی تطبیقی به قلم حجت الاسلام دکتر زنجیر زن حسینی.",
                "table_of_contents": [],
                "sample_reading": []
            }
        ]

    def get_all_books(self) -> List[Dict[str, Any]]:
        """Returns all books."""
        return self.books

    def get_book_by_id(self, book_id: str) -> Dict[str, Any]:
        """Retrieves book details by ID."""
        for b in self.books:
            if b["id"] == book_id:
                return b
        raise EntityNotFoundException(entity="Book", identifier=book_id)

    def get_book_sample(self, book_id: str) -> Dict[str, Any]:
        """Returns sample reader content formatted for Taaghche/Fidibo reader components."""
        book = self.get_book_by_id(book_id)
        return {
            "book_id": book["id"],
            "title": book["title"],
            "total_pages": book["pages_count"],
            "sample_pages": book["sample_reading"],
            "table_of_contents": book["table_of_contents"]
        }

    def update_book(self, book_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Updates book fields dynamically."""
        book = self.get_book_by_id(book_id)
        for k, v in updates.items():
            if v is not None:
                book[k] = v
        return book


book_service = BookService()

