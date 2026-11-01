"""
Book and E-Reader Service.
Provides book catalog and Fidibo/Taaghche inspired sample reader spreads.
"""
from typing import List, Dict, Any, Optional
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

    async def get_all_books_async(self, db: Optional[Any] = None) -> List[Dict[str, Any]]:
        """Returns all books from database if db is available, falling back to memory."""
        if db is not None:
            from sqlalchemy import select
            from backend.app.models.models import BookModel
            try:
                res = await db.execute(select(BookModel).order_by(BookModel.created_at.asc()))
                models = res.scalars().all()
                if models:
                    db_books = [m.to_dict() for m in models]
                    mem_map = {b["id"]: b for b in self.books}
                    for b in db_books:
                        if b["id"] in mem_map:
                            b["table_of_contents"] = mem_map[b["id"]].get("table_of_contents", [])
                            b["sample_reading"] = mem_map[b["id"]].get("sample_reading", [])
                    return db_books
            except Exception:
                pass
        return self.books

    def get_book_by_id(self, book_id: str) -> Dict[str, Any]:
        """Retrieves book details by ID."""
        for b in self.books:
            if b["id"] == book_id:
                return b
        raise EntityNotFoundException(entity="Book", identifier=book_id)

    async def get_book_by_id_async(self, book_id: str, db: Optional[Any] = None) -> Dict[str, Any]:
        """Retrieves book details by ID from database if db is available, falling back to memory."""
        if db is not None:
            from sqlalchemy import select
            from backend.app.models.models import BookModel
            try:
                res = await db.execute(select(BookModel).where(BookModel.id == book_id))
                m = res.scalar_one_or_none()
                if m:
                    b_dict = m.to_dict()
                    for b in self.books:
                        if b["id"] == book_id:
                            b_dict["table_of_contents"] = b.get("table_of_contents", [])
                            b_dict["sample_reading"] = b.get("sample_reading", [])
                            break
                    return b_dict
            except Exception:
                pass
        return self.get_book_by_id(book_id)

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

    async def get_book_sample_async(self, book_id: str, db: Optional[Any] = None) -> Dict[str, Any]:
        """Returns sample reader content formatted for reader components with database fallback."""
        book = await self.get_book_by_id_async(book_id, db=db)
        return {
            "book_id": book["id"],
            "title": book["title"],
            "total_pages": book["pages_count"],
            "sample_pages": book.get("sample_reading", []),
            "table_of_contents": book.get("table_of_contents", [])
        }

    def update_book(self, book_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        """Updates book fields dynamically."""
        book = self.get_book_by_id(book_id)
        for k, v in updates.items():
            if v is not None:
                book[k] = v
        return book

    async def update_book_async(self, book_id: str, updates: Dict[str, Any], db: Optional[Any] = None) -> Dict[str, Any]:
        """Updates book fields in database and memory."""
        mem_book = None
        for b in self.books:
            if b.get("id") == book_id:
                for k, v in updates.items():
                    if v is not None:
                        b[k] = v
                mem_book = b
                break

        if db is not None:
            from sqlalchemy import select
            from backend.app.models.models import BookModel
            res = await db.execute(select(BookModel).where(BookModel.id == book_id))
            db_book = res.scalar_one_or_none()
            if db_book:
                for col in ["title", "subtitle", "author", "publisher", "print_edition", "pages_count", "isbn", "price", "physical_price", "stock", "cover_image", "synopsis", "is_coming_soon"]:
                    if col in updates and updates[col] is not None:
                        setattr(db_book, col, updates[col])
                await db.flush()
                return db_book.to_dict()

        if not mem_book:
            raise EntityNotFoundException(entity="Book", identifier=book_id)
        return mem_book

    def create_book(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Creates and appends a new book to catalog."""
        book_id = data.get("id") or f"book-{len(self.books) + 1}"
        new_book = {
            "id": book_id,
            "title": data.get("title", "کتاب جدید"),
            "subtitle": data.get("subtitle", ""),
            "author": data.get("author", "حجت الاسلام دکتر زنجیر زن حسینی"),
            "publisher": data.get("publisher", "انتشارات حیات"),
            "print_edition": data.get("print_edition", "چاپ اول"),
            "pages_count": data.get("pages_count", 350),
            "isbn": data.get("isbn", "978-600-1234-56-7"),
            "price": str(data.get("price", "۳۵۰,۰۰۰")),
            "physical_price": str(data.get("physical_price", "۳۹۰,۰۰۰")),
            "stock": data.get("stock", 50),
            "format": data.get("format", "نسخه چاپی و دیجیتال"),
            "cover_image": data.get("cover_image", "/images/book_cover_real.jpg"),
            "sample_pdf_url": data.get("sample_pdf_url", f"/sample-books/{book_id}.pdf"),
            "fidibo_reader_url": data.get("fidibo_reader_url", f"/books/{book_id}"),
            "synopsis": data.get("synopsis", ""),
            "is_coming_soon": data.get("is_coming_soon", False),
            "table_of_contents": data.get("table_of_contents", []),
            "sample_reading": data.get("sample_reading", []),
        }
        self.books.append(new_book)
        return new_book

    async def create_book_async(self, data: Dict[str, Any], db: Optional[Any] = None) -> Dict[str, Any]:
        """Creates and persists a book in database and memory."""
        new_book = self.create_book(data)
        if db is not None:
            from sqlalchemy import select
            from backend.app.models.models import BookModel
            res = await db.execute(select(BookModel).where(BookModel.id == new_book["id"]))
            if not res.scalar_one_or_none():
                db_b = BookModel(
                    id=new_book["id"],
                    title=new_book["title"],
                    subtitle=new_book.get("subtitle"),
                    author=new_book.get("author", "حجت الاسلام دکتر زنجیر زن حسینی"),
                    publisher=new_book.get("publisher", "انتشارات حیات"),
                    print_edition=new_book.get("print_edition", "چاپ اول"),
                    pages_count=int(new_book.get("pages_count", 350)),
                    isbn=new_book.get("isbn", "978-600-1234-56-7"),
                    price=str(new_book.get("price", "۳۵۰,۰۰۰")),
                    physical_price=str(new_book.get("physical_price", "۳۹۰,۰۰۰")),
                    stock=int(new_book.get("stock", 50)),
                    cover_image=new_book.get("cover_image", "/images/book_cover_real.jpg"),
                    synopsis=new_book.get("synopsis", ""),
                    is_coming_soon=bool(new_book.get("is_coming_soon", False)),
                )
                db.add(db_b)
                await db.flush()
        return new_book

    def delete_book(self, book_id: str) -> bool:
        """Deletes book by ID."""
        for i, b in enumerate(self.books):
            if b["id"] == book_id:
                self.books.pop(i)
                return True
        raise EntityNotFoundException(entity="Book", identifier=book_id)

    async def delete_book_async(self, book_id: str, db: Optional[Any] = None) -> bool:
        """Deletes book by ID in database and memory."""
        deleted = False
        for i, b in enumerate(self.books):
            if b["id"] == book_id:
                self.books.pop(i)
                deleted = True
                break

        if db is not None:
            from sqlalchemy import select
            from backend.app.models.models import BookModel
            res = await db.execute(select(BookModel).where(BookModel.id == book_id))
            m = res.scalar_one_or_none()
            if m:
                await db.delete(m)
                await db.flush()
                return True

        if not deleted:
            raise EntityNotFoundException(entity="Book", identifier=book_id)
        return True


book_service = BookService()

