"""
SQLAlchemy ORM Database Models for the Platform.
Complies with BACKEND_SYSTEM_DESIGN.md.
"""
import json
from datetime import datetime
from typing import Optional, Dict, Any, List
from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    Index,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship, validates, synonym
from backend.app.models.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    icon_name = Column(String(50), default="BookOpen")
    display_order = Column(Integer, default=0)

    courses = relationship("Course", back_populates="category", cascade="all, delete-orphan")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "name_fa": self.name,
            "name_ar": self.name,
            "name_en": self.slug,
            "slug": self.slug,
            "description": self.description or "",
            "description_fa": self.description or "",
            "description_ar": self.description or "",
            "description_en": self.description or "",
            "iconName": self.icon_name or "BookOpen",
            "icon_name": self.icon_name or "BookOpen",
            "display_order": self.display_order,
            "count": len(self.courses) if "courses" in self.__dict__ and self.courses else 0,
        }


class Course(Base):
    __tablename__ = "courses"

    id = Column(String(50), primary_key=True, index=True)
    category_id = Column(String(50), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True)
    title_fa = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    course_type = Column(String(20), default="offline", index=True)  # 'offline' or 'online'
    desc_fa = Column(Text, nullable=True)
    author_name = Column(String(255), default="حجت الاسلام دکتر زنجیر زن حسینی")
    level = Column(String(50), default="سطوح عالی و خارج")
    
    # Online Skyroom specific fields
    capacity = Column(Integer, default=30)
    enrolled_count = Column(Integer, default=0)
    skyroom_url = Column(String(500), nullable=True)
    schedule = Column(String(255), nullable=True)
    
    # Metadata
    cover_image = Column(String(500), nullable=True)
    total_duration_hours = Column(Integer, default=0)
    is_published = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    category = relationship("Category", back_populates="courses")
    lessons = relationship("Lesson", back_populates="course", cascade="all, delete-orphan", order_by="Lesson.session_number")
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")
    favorited_by = relationship("UserFavorite", back_populates="course", cascade="all, delete-orphan")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(String(50), primary_key=True, index=True)
    course_id = Column(String(50), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    session_number = Column(Integer, nullable=False)
    title_fa = Column(String(255), nullable=False)
    audio_url = Column(String(500), nullable=False)
    duration_seconds = Column(Integer, default=0)
    audio_size_mb = Column(String(20), default="0")
    is_free_sample = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    course = relationship("Course", back_populates="lessons")

    __table_args__ = (
        Index("ix_lessons_course_session", "course_id", "session_number"),
    )


class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, index=True)
    mobile = Column(String(20), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=True)
    full_name = Column(String(100), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="student", index=True)  # 'student' | 'admin'
    wallet_balance = Column(String(50), default="0 Tomans")
    avatar_url = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    enrollments = relationship("Enrollment", back_populates="user", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("UserFavorite", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")

    @property
    def phone(self) -> str:
        return self.mobile

    @phone.setter
    def phone(self, val: str):
        self.mobile = val

    phone = synonym("mobile", descriptor=property(phone.fget, phone.fset))

    def to_dict(
        self,
        access_token: Optional[str] = None,
        enrolled_courses_count: Optional[int] = None,
        enrolled_course_ids: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Serializes user object for API responses and AuthContext session hydration.
        """
        if enrolled_course_ids is not None:
            course_ids = list(enrolled_course_ids)
        elif "enrollments" in self.__dict__ and self.enrollments is not None:
            course_ids = [
                e.course_id for e in self.enrollments
                if getattr(e, "status", "active") == "active"
            ]
        else:
            course_ids = []

        if enrolled_courses_count is not None:
            count = enrolled_courses_count
        elif course_ids:
            count = len(course_ids)
        elif "enrollments" in self.__dict__ and self.enrollments is not None:
            count = len(self.enrollments)
        else:
            count = 0

        data = {
            "id": self.id,
            "full_name": self.full_name or "",
            "phone": self.mobile,
            "role": self.role or "student",
            "wallet_balance": self.wallet_balance or "0 Tomans",
            "enrolled_courses_count": count,
            "enrolled_course_ids": course_ids,
            "avatar_url": self.avatar_url,
        }
        if access_token is not None:
            data["access_token"] = access_token
        return data


class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    device_name = Column(String(100), default="مرورگر وب")
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(255), nullable=True)
    token_jti = Column(String(50), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_active_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="sessions")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "device_name": self.device_name,
            "ip_address": self.ip_address,
            "token_jti": self.token_jti,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_active_at": self.last_active_at.isoformat() if self.last_active_at else None,
            "is_active": self.is_active,
        }


class Enrollment(Base):
    __tablename__ = "enrollments"
    __table_args__ = (
        UniqueConstraint("user_id", "course_id", name="uq_user_course_enrollment"),
        Index("ix_enrollments_user_course", "user_id", "course_id"),
    )

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(50), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    enrolled_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String(20), default="active")

    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "course_id": self.course_id,
            "enrolled_at": self.enrolled_at.isoformat() if self.enrolled_at else None,
            "status": self.status or "active",
        }


class UserFavorite(Base):
    __tablename__ = "user_favorites"
    __table_args__ = (
        UniqueConstraint("user_id", "course_id", name="uq_user_course_favorite"),
        Index("ix_user_favorites_user_course", "user_id", "course_id"),
    )

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(50), ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="favorites")
    course = relationship("Course", back_populates="favorited_by")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "course_id": self.course_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class AnalyticsLog(Base):
    __tablename__ = "analytics_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_type = Column(String(50), index=True, nullable=False)  # 'play_audio', 'view_course', 'enroll'
    resource_id = Column(String(100), nullable=True, index=True)
    user_id = Column(String(50), nullable=True, index=True)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(255), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)


class Order(Base):
    __tablename__ = "orders"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    tracking_number = Column(String(50), unique=True, index=True, nullable=False)
    status = Column(String(30), default="processing", index=True)
    total_amount = Column(Integer, default=0)
    items_count = Column(Integer, default=1)
    shipping_address = Column(Text, nullable=True)
    postal_code = Column(String(20), nullable=True)
    recipient_name = Column(String(100), nullable=True)
    recipient_phone = Column(String(20), nullable=True)
    postal_barcode_24digit = Column(String(50), nullable=True, index=True)
    coupon_code = Column(String(50), nullable=True)
    discount_amount = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

    def to_dict(self) -> Dict[str, Any]:
        items_data = []
        if "items" in self.__dict__ and self.items is not None:
            items_data = [item.to_dict() for item in self.items]
        return {
            "order_id": self.id,
            "user_id": self.user_id,
            "tracking_number": self.tracking_number,
            "status": self.status or "processing",
            "total_amount": self.total_amount,
            "items_count": self.items_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "postal_barcode_24digit": self.postal_barcode_24digit,
            "shipping_address": self.shipping_address,
            "postal_code": self.postal_code,
            "recipient_name": self.recipient_name,
            "recipient_phone": self.recipient_phone,
            "coupon_code": self.coupon_code,
            "discount_amount": self.discount_amount,
            "items": items_data,
        }


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(String(50), primary_key=True, index=True)
    order_id = Column(String(50), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    item_id = Column(String(50), nullable=False, index=True)
    item_type = Column(String(30), default="course", index=True)  # 'course' | 'book_digital' | 'book_print'
    title = Column(String(255), nullable=False)
    price = Column(Integer, default=0)
    quantity = Column(Integer, default=1)
    cover_image = Column(String(500), nullable=True)

    order = relationship("Order", back_populates="items")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "order_id": self.order_id,
            "item_id": self.item_id,
            "item_type": self.item_type,
            "title": self.title,
            "price": self.price,
            "quantity": self.quantity,
            "cover_image": self.cover_image,
        }


class BookModel(Base):
    __tablename__ = "books"

    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    subtitle = Column(String(255), nullable=True)
    author = Column(String(255), default="حجت الاسلام دکتر زنجیر زن حسینی")
    publisher = Column(String(255), default="انتشارات حیات")
    print_edition = Column(String(100), default="چاپ اول (گالینگور نفیس)")
    pages_count = Column(Integer, default=385)
    isbn = Column(String(50), default="978-622-02-1948-1")
    price = Column(String(50), default="۳۸۵,۰۰۰")
    physical_price = Column(String(50), default="۳۸۵,۰۰۰")
    stock = Column(Integer, default=50)
    cover_image = Column(String(500), default="/images/book_cover_real.jpg")
    synopsis = Column(Text, nullable=True)
    is_coming_soon = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "subtitle": self.subtitle or "",
            "author": self.author,
            "publisher": self.publisher,
            "print_edition": self.print_edition,
            "pages_count": self.pages_count,
            "isbn": self.isbn,
            "price": self.price,
            "physical_price": self.physical_price,
            "stock": self.stock,
            "format": "نسخه چاپی و دیجیتال",
            "cover_image": self.cover_image,
            "sample_pdf_url": f"/sample-books/{self.id}.pdf",
            "fidibo_reader_url": f"/books/{self.id}",
            "synopsis": self.synopsis or "",
            "table_of_contents": [],
            "sample_reading": [],
        }


class LessonProgress(Base):
    __tablename__ = "lesson_progress"
    __table_args__ = (
        UniqueConstraint("user_id", "course_id", "chapter_id", name="uq_user_course_chapter_progress"),
        Index("ix_lesson_progress_user_course", "user_id", "course_id"),
    )

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(50), nullable=False, index=True)
    chapter_id = Column(Integer, nullable=False)
    progress_percent = Column(Integer, default=0)
    last_pos_sec = Column(Integer, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": True,
            "user_id": self.user_id,
            "course_id": self.course_id,
            "chapter_id": self.chapter_id,
            "progress_percent": self.progress_percent,
            "last_pos_sec": self.last_pos_sec,
            "updated_at": self.updated_at.isoformat() if self.updated_at else datetime.utcnow().isoformat(),
        }


class StudyNote(Base):
    __tablename__ = "study_notes"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(50), nullable=False, index=True)
    chapter_id = Column(Integer, default=1)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    timestamp_sec = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "course_id": self.course_id,
            "chapter_id": self.chapter_id,
            "title": self.title,
            "content": self.content,
            "timestamp_sec": self.timestamp_sec,
            "created_at": self.created_at.isoformat() if self.created_at else datetime.utcnow().isoformat(),
        }


class QADiscussion(Base):
    __tablename__ = "qa_discussions"

    id = Column(String(50), primary_key=True, index=True)
    course_id = Column(String(50), nullable=False, index=True)
    chapter_id = Column(Integer, default=1)
    user_id = Column(String(50), nullable=True, index=True)
    user_name = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    question_text = Column(Text, nullable=False)
    answer_text = Column(Text, nullable=True)
    is_resolved = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "course_id": self.course_id,
            "chapter_id": self.chapter_id,
            "user_name": self.user_name,
            "title": self.title,
            "question_text": self.question_text,
            "answer_text": self.answer_text,
            "is_resolved": self.is_resolved,
            "created_at": self.created_at.isoformat() if self.created_at else datetime.utcnow().isoformat(),
        }


class Coupon(Base):
    __tablename__ = "coupons"

    code = Column(String(50), primary_key=True, index=True)
    discount_percent = Column(Integer, nullable=False)
    max_uses = Column(Integer, default=100)
    used_count = Column(Integer, default=0)
    expires_at = Column(String(50), default="2027-12-30T23:59:59")
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "code": self.code,
            "discount_percent": self.discount_percent,
            "max_uses": self.max_uses,
            "used_count": self.used_count,
            "expires_at": self.expires_at,
            "active": self.is_active,
        }


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(String(50), nullable=False, index=True)
    certificate_code = Column(String(60), unique=True, index=True, nullable=False)
    score = Column(String(50), default="عالی (۱۰۰ از ۱۰۰)")
    issued_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "course_id": self.course_id,
            "certificate_code": self.certificate_code,
            "score": self.score,
            "issued_at": self.issued_at.isoformat() if self.issued_at else datetime.utcnow().isoformat(),
        }


class Subscriber(Base):
    __tablename__ = "subscribers"

    id = Column(String(50), primary_key=True, index=True)
    contact = Column(String(120), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "contact": self.contact,
            "created_at": self.created_at.isoformat() if self.created_at else datetime.utcnow().isoformat(),
        }


class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    authority = Column(String(100), primary_key=True, index=True)
    order_id = Column(String(50), nullable=False, index=True)
    user_id = Column(String(50), nullable=True, index=True)
    gateway = Column(String(50), default="zarinpal")
    amount = Column(Integer, nullable=False, default=0)
    return_url = Column(String(500), nullable=False)
    status = Column(String(20), nullable=False, default="pending", index=True)  # pending | verifying | paid | failed
    reference_id = Column(String(100), nullable=True, index=True)
    tracking_code = Column(String(100), nullable=True, unique=True, index=True)
    card_mask = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    paid_at = Column(DateTime, nullable=True)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "authority": self.authority,
            "payment_token": self.authority,
            "order_id": self.order_id,
            "user_id": self.user_id,
            "gateway": self.gateway,
            "amount": self.amount,
            "return_url": self.return_url,
            "status": self.status,
            "reference_id": self.reference_id,
            "tracking_code": self.tracking_code,
            "card_mask": self.card_mask,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "paid_at": self.paid_at.isoformat() if self.paid_at else None,
        }


class SiteConfig(Base):
    __tablename__ = "site_configs"

    key = Column(String(100), primary_key=True, index=True)
    value_json = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        try:
            val = json.loads(self.value_json)
        except Exception:
            val = self.value_json
        return {
            "key": self.key,
            "value": val,
            "updated_at": self.updated_at.isoformat() if self.updated_at else datetime.utcnow().isoformat(),
        }


class ArticleModel(Base):
    __tablename__ = "articles"

    id = Column(String(50), primary_key=True, index=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    title_fa = Column(String(255), nullable=False)
    title_ar = Column(String(255), nullable=True)
    title_en = Column(String(255), nullable=True)
    category_fa = Column(String(100), default="فلسفه")
    category_ar = Column(String(100), nullable=True)
    category_en = Column(String(100), nullable=True)
    read_time_fa = Column(String(50), default="۱۰ دقیقه مطالعه")
    read_time_ar = Column(String(50), nullable=True)
    read_time_en = Column(String(50), nullable=True)
    publish_date_fa = Column(String(50), default="۱۴۰۳")
    publish_date_ar = Column(String(50), nullable=True)
    publish_date_en = Column(String(50), nullable=True)
    abstract_fa = Column(Text, nullable=True)
    abstract_ar = Column(Text, nullable=True)
    abstract_en = Column(Text, nullable=True)
    content_fa = Column(Text, nullable=True)
    content_ar = Column(Text, nullable=True)
    content_en = Column(Text, nullable=True)
    pdf_url = Column(String(500), nullable=True)
    author = Column(String(255), default="حجت الاسلام دکتر زنجیر زن حسینی")
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "slug": self.slug,
            "title": self.title_fa,
            "title_fa": self.title_fa,
            "title_ar": self.title_ar or self.title_fa,
            "title_en": self.title_en or self.title_fa,
            "category": self.category_fa,
            "category_fa": self.category_fa,
            "category_ar": self.category_ar or self.category_fa,
            "category_en": self.category_en or self.category_fa,
            "readTime": self.read_time_fa,
            "readTime_fa": self.read_time_fa,
            "readTime_ar": self.read_time_ar or self.read_time_fa,
            "readTime_en": self.read_time_en or self.read_time_fa,
            "publishDate": self.publish_date_fa,
            "publishDate_fa": self.publish_date_fa,
            "publishDate_ar": self.publish_date_ar or self.publish_date_fa,
            "publishDate_en": self.publish_date_en or self.publish_date_fa,
            "abstract": self.abstract_fa or "",
            "abstract_fa": self.abstract_fa or "",
            "abstract_ar": self.abstract_ar or self.abstract_fa or "",
            "abstract_en": self.abstract_en or self.abstract_fa or "",
            "content_fa": self.content_fa or "",
            "content_ar": self.content_ar or "",
            "content_en": self.content_en or "",
            "pdf_url": self.pdf_url or "",
            "author": self.author,
            "created_at": self.created_at.isoformat() if self.created_at else datetime.utcnow().isoformat(),
        }

