# گزارش تفصیلی استخراج مشخصات فنی اندپوینت‌ها و سرویس‌های M1 (M1 Endpoints & Services Spec Report)
## پایگاه رسمی حجت الاسلام دکتر زنجیر زن حسینی

**تهیه‌کننده:** کاوشگر مشخصات فنی اندپوینت‌ها (`spec_miner_m1_endpoints`)  
**تاریخ گزارش:** ۲۱ مهر ۱۴۰۵ (2026-10-13)  
**نسخه سند:** ۱.۰  
**محدوده کاری:** `courses.py`, `course_service.py`, `orders.py`, `order_service.py`, `auth.py`, `auth_service.py`, `schemas/course.py`, `schemas/auth.py`

---

## ۱. فهرست ویژگی‌های کشف‌شده (Features Discovered)

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| ۱ | Course Enrollment | `POST /api/v1/courses/{course_id}/enroll` | ثبت‌نام رسمی و پایدار دانشجو در دوره صوتی در پایگاه داده SQLite (`enrollments`) | Path: `course_id: str`<br>Header: `Authorization: Bearer <token>` | HTTP 200 JSON:<br>`CourseEnrollResponse`<br>(`success: true`, `enrollment_id`, `course_id`, `enrolled_at`, `status: "active"`) | ۴۰۱: عدم احراز هویت<br>۴۰۴: دوره ناموجود (`EntityNotFoundException`)<br>۴۰۰: ثبت‌نام تکراری (`AppException: DUPLICATE_ENROLLMENT`) | `ORIGINAL_REQUEST §R1`, `PROJECT.md` |
| ۲ | Enrolled Courses Retrieval | `GET /api/v1/courses/enrolled` | واکشی لیست تمام دوره‌های فعال ثبت‌نام‌شده دانشجو از دیتابیس SQLite جهت باز کردن قفل جلسات | Header: `Authorization: Bearer <token>` | HTTP 200 JSON:<br>`List[CourseDetailSchema]` | ۴۰۱: عدم احراز هویت یا توکن نامعتبر | `ORIGINAL_REQUEST §R1`, `PROJECT.md` |
| ۳ | Order Creation & Auto-Enrollment | `POST /api/v1/orders/create` (Async) | تبدیل به `async def`، انتساب سفارش به کاربر احراز هویت‌شده اختیاری، ثبت در جدول `orders` و ثبت‌نام خودکار دوره‌های خریداری‌شده در `enrollments` | Body: `CreateOrderRequest`<br>Header: `Authorization: Bearer <token>` (اختیاری) | HTTP 200 JSON:<br>`OrderSummaryResponse`<br>(`order_id`, `tracking_number`, `status`, `total_amount`, `items_count`, `postal_barcode_24digit`) | ۴۲۲: اعتبارسنجی ناموفق بادی<br>۴۰۰: کوپن نامعتبر | `ORIGINAL_REQUEST §R1`, `survey_backend.md` |
| ۴ | Duplicate Enrollment Shield | اعتبارسنجی عدم تکرار ثبت‌نام | بررسی ثبت‌نام فعال پیشین و جلوگیری از درج رکورد تکراری با پرتاب خطای ساختاریافته فارسی | `user_id: str`, `course_id: str` | ثبت‌نام جدید در صورت عدم وجود | HTTP 400 با پیام مشخص فارسی و کد `DUPLICATE_ENROLLMENT` | `DISPATCH.md`, `ORIGINAL_REQUEST §R1` |
| ۵ | Session Hydration with Enrolled IDs | `GET /api/v1/auth/me` & `UserResponse` | افزودن شناسه‌های دوره‌های ثبت‌نام‌شده به نمایه کاربر جهت همگام‌سازی وضعیت کلاینت پس از رفرش صفحه | Header: `Authorization: Bearer <token>` | HTTP 200 JSON:<br>`UserResponse` با فیلدهای:<br>`enrolled_course_ids: List[str]`<br>`enrolled_courses_count: int` | ۴۰۱: توکن نامعتبر یا منقضی | `DISPATCH.md`, `PROJECT.md` |
| ۶ | Route Collision Immunity | اولویت‌بندی مسیرهای روتینگ | تعریف روت `/enrolled` قبل از `/{course_id}` در `courses.py` برای جلوگیری از بلعیده شدن درخواست توسط پارامتر مسیر | مسیر HTTP GET | هدایت صحیح به کنترلر دوره‌های کاربر به جای جستجوی دوره با شناسه `enrolled` | ۴۰۴ در صورت رعایت نشدن اولویت مسیر | کالبدشکافی کد `courses.py` و قوانین FastAPI/Starlette |
| ۷ | Foreign Key Prerequisite Check | حصول اطمینان از وجود دوره در جدول دیتابیس | به دلیل فعال بودن `PRAGMA foreign_keys=ON;` در SQLite، دوره باید پیش از درج در `enrollments` در جدول `courses` ثبت شده باشد | `course_id` | رکورد معتبر `Course` در SQLite | SQLite IntegrityError (FOREIGN KEY constraint failed) | بررسی `database.py` و `models.py` |

---

## ۲. موارد مرزی و حالات خاص (Edge Cases)

| # | Feature | Input | Observed / Expected Behavior |
|---|---------|-------|------------------------------|
| ۱ | Course Enrollment | دوره با شناسه نامعتبر (`course-invalid-999`) | پرتاب `EntityNotFoundException` و بازگشت HTTP 404 با جزئیات شیء ناموجود |
| ۲ | Duplicate Enrollment | ثبت‌نام مجدد در دوره فعال قبلی (`course-mabadi-mantiq`) | پرتاب `AppException` با وضعیت ۴۰۰، بدون درج در دیتابیس، و با پیام دقیق: «شما پیش از این در دوره «{course_title}» ثبت‌نام کرده‌اید و جلسات دوره برای شما در دسترس است.» |
| ۳ | Route Matching | درخواست به `GET /api/v1/courses/enrolled` | اگر روت بعد از `/{course_id}` باشد، مقدار `course_id="enrolled"` فرض شده و ۴۰۴ می‌دهد. با قرارگیری قبل از `/{course_id}`، لیست دوره‌ها با کد ۲۰۰ بازگردانده می‌شود. |
| ۴ | Order Auto-Enrollment | سبد خرید حاوی دوره و کاربر مهمان (بدون توکن احراز هویت) | سفارش بدون کاربر در دیتابیس ذخیره شده و هیچ رکوردی در جدول `enrollments` درج نمی‌شود (بدون خطا). |
| ۵ | Order Auto-Enrollment | سبد خرید حاوی دوره‌ای که کاربر قبلاً در آن ثبت‌نام داشته است | سفارش با موفقیت ثبت می‌شود و دوره تکراری بدون شکست کل تراکنش نادیده گرفته می‌شود (Idempotent). |
| ۶ | Session Hydration | کاربر تازه ثبت‌نام‌شده بدون هیچ دوره ثبت‌نامی | بازگشت `enrolled_course_ids: []` و `enrolled_courses_count: 0` با کد ۲۰۰. |
| ۷ | Database FK Constraint | ثبت‌نام در دوره‌ای از کاتالوگ که هنوز در جدول SQLite درج نشده است | سرویس ابتدا رکورد دوره را از کاتالوگ حافظه به دیتابیس درج و `flush` می‌کند، سپس ثبت‌نام را انجام می‌دهد تا خطای Foreign Key رخ ندهد. |

---

## ۳. قراردادهای فنی رابط‌ها و امضای دقیق متدها (Exact Technical Contracts)

### ۳.۱. مدل‌های Pydantic (`backend/app/schemas/`)

#### در `backend/app/schemas/course.py`:
```python
from pydantic import BaseModel, Field
from typing import List, Optional

class CourseEnrollResponse(BaseModel):
    success: bool = Field(True, example=True)
    message: str = Field(..., example="ثبت‌نام شما در دوره «سلسله جلسات مبادی منطق و تفکر عقلانی» با موفقیت انجام شد.")
    enrollment_id: str = Field(..., example="enr-9b2f3c4d")
    course_id: str = Field(..., example="course-mabadi-mantiq")
    enrolled_at: str = Field(..., example="2026-10-13T10:00:00")
    status: str = Field("active", example="active")


class EnrolledCoursesResponse(BaseModel):
    total: int = Field(..., example=1)
    items: List[CourseDetailSchema]
```

#### در `backend/app/schemas/auth.py`:
```python
from pydantic import BaseModel, Field
from typing import List, Optional

class UserResponse(BaseModel):
    id: str = Field(..., example="usr-140301")
    full_name: str = Field(..., example="Ali Mousavi")
    phone: str = Field(..., example="09123456789")
    role: str = Field(..., example="student")
    wallet_balance: str = Field(..., example="350,000 Tomans")
    enrolled_courses_count: int = Field(0, example=2)
    enrolled_course_ids: List[str] = Field(default_factory=list, example=["course-mabadi-mantiq"])
    access_token: Optional[str] = None
```

---

### ۳.۲. لایه اندپوینت‌ها (`backend/app/api/v1/endpoints/`)

#### ۱. در `courses.py`:
ترتیب قرارگیری متدها الزامی است:
```python
from typing import List
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.schemas.course import (
    CourseDetailSchema,
    CourseEnrollResponse,
    ProgressSyncRequest,
    ProgressSyncResponse,
)
from backend.app.services.course_service import course_service
from backend.app.api.deps import get_current_user
from backend.app.models.database import get_db

router = APIRouter()

@router.get("/", response_model=List[CourseDetailSchema], summary="List all audio courses")
async def list_courses():
    return course_service.get_all_courses()


# ⚠️ الزامی: این روت حتماً باید قبل از /{course_id} قرار گیرد!
@router.get("/enrolled", response_model=List[CourseDetailSchema], summary="Get enrolled courses of current student")
async def get_enrolled_courses(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieves all active courses unlocked for the current authenticated student.
    """
    return await course_service.get_enrolled_courses_for_user(db=db, user_id=user["id"])


@router.post("/{course_id}/enroll", response_model=CourseEnrollResponse, summary="Enroll student in course")
async def enroll_course(
    course_id: str,
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Enrolls the authenticated student in the specified lecture series.
    Rejects duplicate enrollments with HTTP 400 and structured Persian AppException.
    """
    return await course_service.enroll_student(db=db, user_id=user["id"], course_id=course_id)


@router.get("/{course_id}", response_model=CourseDetailSchema, summary="Get course details by ID")
async def get_course(course_id: str):
    try:
        return course_service.get_course_by_id(course_id)
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))
```

#### ۲. در `orders.py`:
```python
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.app.schemas.order import CreateOrderRequest, OrderSummaryResponse
from backend.app.services.order_service import order_service
from backend.app.api.deps import get_optional_user
from backend.app.models.database import get_db

router = APIRouter()

@router.post("/create", response_model=OrderSummaryResponse, summary="Create a new order")
async def create_order(
    req: CreateOrderRequest,
    user: Optional[dict] = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Submits a new order, optionally connects to student, records in database,
    and automatically enrolls the student in purchased courses.
    """
    raw_items = [i.model_dump() for i in req.items]
    return await order_service.create_order_tx(
        items=raw_items,
        shipping_address=req.shipping_address,
        postal_code=req.postal_code,
        recipient_name=req.recipient_name,
        recipient_phone=req.recipient_phone,
        coupon_code=req.coupon_code,
        user=user,
        db=db,
    )
```

#### ۳. در `auth.py`:
اندپوینت `GET /me` بدون تغییر ساختاری، با اتکا به به‌روزرسانی `auth_service.get_user_by_id` و `UserResponse`، فیلدهای `enrolled_course_ids` و `enrolled_courses_count` را به درستی منتشر می‌کند:
```python
@router.get("/me", response_model=UserResponse, summary="Get current authenticated user profile")
async def get_me(user: dict = Depends(get_current_user)):
    """
    Retrieves the currently authenticated user session with active enrollments.
    """
    return user
```

---

### ۳.۳. لایه سرویس‌ها (`backend/app/services/`)

#### ۱. پیاده‌سازی متدهای ثبت‌نام در `backend/app/services/course_service.py`:
```python
import uuid
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.models import Course, Enrollment
from backend.app.core.exceptions import AppException, EntityNotFoundException

class CourseService:
    ...
    async def enroll_student(self, db: AsyncSession, user_id: str, course_id: str) -> Dict[str, Any]:
        """
        Enrolls a student in a course with DB persistence and duplicate check.
        """
        # ۱. واکشی اطلاعات دوره از کاتالوگ
        course = self.get_course_by_id(course_id)
        course_title = course.get("title", course_id)

        # ۲. تضمین وجود دوره در جدول دیتابیس برای ارضای کلید خارجی SQLite
        course_res = await db.execute(select(Course).where(Course.id == course_id))
        if not course_res.scalar_one_or_none():
            db_course = Course(
                id=course_id,
                title_fa=course_title,
                slug=course.get("slug", course_id),
                author_name=course.get("instructor", "حجت الاسلام دکتر زنجیر زن حسینی"),
                desc_fa=course.get("description", ""),
                level=course.get("level", "سطوح عالی و خارج"),
                is_published=True,
            )
            db.add(db_course)
            await db.flush()

        # ۳. بررسی ثبت‌نام قبلی فعال
        enr_stmt = select(Enrollment).where(
            Enrollment.user_id == user_id,
            Enrollment.course_id == course_id,
            Enrollment.status == "active",
        )
        enr_res = await db.execute(enr_stmt)
        if enr_res.scalar_one_or_none():
            raise AppException(
                message=f"شما پیش از این در دوره «{course_title}» ثبت‌نام کرده‌اید و جلسات دوره برای شما در دسترس است.",
                code="DUPLICATE_ENROLLMENT",
                status_code=400,
            )

        # ۴. ایجاد و ذخیره رکورد ثبت‌نام
        enrollment_id = f"enr-{uuid.uuid4().hex[:8]}"
        now = datetime.utcnow()
        enrollment = Enrollment(
            id=enrollment_id,
            user_id=user_id,
            course_id=course_id,
            status="active",
            enrolled_at=now,
        )
        db.add(enrollment)
        await db.flush()

        return {
            "success": True,
            "message": f"ثبت‌نام شما در دوره «{course_title}» با موفقیت انجام شد.",
            "enrollment_id": enrollment_id,
            "course_id": course_id,
            "enrolled_at": now.isoformat(),
            "status": "active",
        }

    async def get_enrolled_courses_for_user(self, db: AsyncSession, user_id: str) -> List[Dict[str, Any]]:
        """
        Retrieves all active courses enrolled by the user.
        """
        stmt = (
            select(Enrollment.course_id)
            .where(
                Enrollment.user_id == user_id,
                Enrollment.status == "active",
            )
            .order_by(Enrollment.enrolled_at.desc())
        )
        res = await db.execute(stmt)
        enrolled_ids = [row[0] for row in res.fetchall()]

        enrolled_courses = []
        for cid in enrolled_ids:
            try:
                enrolled_courses.append(self.get_course_by_id(cid))
            except EntityNotFoundException:
                pass
        return enrolled_courses
```

#### ۲. پیاده‌سازی `create_order_tx` در `backend/app/services/order_service.py`:
```python
import uuid
import time
import random
from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.app.models.models import Order, OrderItem, Enrollment, Course
from backend.app.services.course_service import course_service

class OrderService:
    ...
    async def create_order_tx(
        self,
        items: List[Dict[str, Any]],
        shipping_address: Optional[str] = None,
        postal_code: Optional[str] = None,
        recipient_name: Optional[str] = None,
        recipient_phone: Optional[str] = None,
        coupon_code: Optional[str] = None,
        user: Optional[Dict[str, Any]] = None,
        db: Optional[AsyncSession] = None,
    ) -> Dict[str, Any]:
        order_id = f"ORD-{int(time.time())}-{random.randint(1000, 9999)}"
        tracking_number = f"TRK-{random.randint(10000, 99999)}"

        subtotal = sum(item.get("price", 0) * item.get("quantity", 1) for item in items)
        discount = 0
        if coupon_code:
            try:
                res = self.validate_coupon(coupon_code, subtotal)
                discount = res["discount_amount"]
            except Exception:
                pass

        total_amount = max(0, subtotal - discount)
        has_physical_book = any("book" in str(item.get("item_type", "")).lower() for item in items)
        postal_barcode = "".join([str(random.randint(0, 9)) for _ in range(24)]) if has_physical_book else None

        now = datetime.utcnow()
        user_id = user.get("id") if user else None

        # ذخیره در دیتابیس در صورت وجود نشست دیتابیس
        if db is not None:
            db_order = Order(
                id=order_id,
                user_id=user_id,
                tracking_number=tracking_number,
                status="processing",
                total_amount=total_amount,
                items_count=len(items),
                shipping_address=shipping_address,
                postal_code=postal_code,
                recipient_name=recipient_name,
                recipient_phone=recipient_phone,
                postal_barcode_24digit=postal_barcode,
                created_at=now,
            )
            db.add(db_order)

            for it in items:
                oi_id = f"oit-{uuid.uuid4().hex[:8]}"
                db_item = OrderItem(
                    id=oi_id,
                    order_id=order_id,
                    item_id=str(it.get("item_id", "")),
                    item_type=str(it.get("item_type", "course")),
                    title=str(it.get("title", "")),
                    price=int(it.get("price", 0)),
                    quantity=int(it.get("quantity", 1)),
                )
                db.add(db_item)

            # ثبت‌نام خودکار دوره‌ها در صورت احراز هویت بودن کاربر
            if user_id:
                for it in items:
                    itype = str(it.get("item_type", "")).lower()
                    iid = str(it.get("item_id", ""))
                    if itype == "course" or iid.startswith("course-"):
                        enr_chk = await db.execute(
                            select(Enrollment).where(
                                Enrollment.user_id == user_id,
                                Enrollment.course_id == iid,
                                Enrollment.status == "active",
                            )
                        )
                        if not enr_chk.scalar_one_or_none():
                            # تضمین وجود دوره در دیتابیس
                            c_chk = await db.execute(select(Course).where(Course.id == iid))
                            if not c_chk.scalar_one_or_none():
                                try:
                                    cat_c = course_service.get_course_by_id(iid)
                                    ctitle = cat_c.get("title", iid)
                                    cslug = cat_c.get("slug", iid)
                                except Exception:
                                    ctitle = it.get("title", iid)
                                    cslug = iid
                                db_c = Course(
                                    id=iid,
                                    title_fa=ctitle,
                                    slug=cslug,
                                    author_name="حجت الاسلام دکتر زنجیر زن حسینی",
                                    desc_fa="",
                                    level="سطوح عالی و خارج",
                                    is_published=True,
                                )
                                db.add(db_c)
                                await db.flush()

                            auto_enr = Enrollment(
                                id=f"enr-{uuid.uuid4().hex[:8]}",
                                user_id=user_id,
                                course_id=iid,
                                status="active",
                                enrolled_at=now,
                            )
                            db.add(auto_enr)

            await db.flush()

        order_data = {
            "order_id": order_id,
            "tracking_number": tracking_number,
            "status": "processing",
            "total_amount": total_amount,
            "items_count": len(items),
            "created_at": now.isoformat(),
            "postal_barcode_24digit": postal_barcode,
            "shipping_address": shipping_address,
            "postal_code": postal_code,
            "recipient_name": recipient_name,
            "recipient_phone": recipient_phone,
            "items": items,
        }
        self.orders[order_id] = order_data
        return order_data
```

#### ۳. ارتقای `get_user_by_id` در `backend/app/services/auth_service.py`:
```python
from backend.app.models.models import Enrollment

async def get_user_by_id(
    self,
    user_id_or_db: Any = None,
    user_id: Optional[str] = None,
    db: Optional[AsyncSession] = None,
    **kwargs,
) -> Optional[Dict[str, Any]]:
    # استخراج دیتابیس و شناسه کاربر...
    ...
    async def _fetch_with_enrollments(session: AsyncSession, uid: str):
        res = await session.execute(select(User).where(User.id == uid))
        user = res.scalar_one_or_none()
        if not user:
            return None
        enr_res = await session.execute(
            select(Enrollment.course_id).where(
                Enrollment.user_id == uid,
                Enrollment.status == "active",
            )
        )
        enrolled_ids = [row[0] for row in enr_res.fetchall()]
        return user.to_dict(
            enrolled_courses_count=len(enrolled_ids),
            enrolled_course_ids=enrolled_ids,
        )

    if actual_db is None:
        async with async_session() as session:
            return await _fetch_with_enrollments(session, actual_user_id)
    return await _fetch_with_enrollments(actual_db, actual_user_id)
```

---

## ۴. استانداردهای انضباط نگارش فارسی و هویت استاد

1. **نام رسمی استاد:** در کلیه بذرگذاری‌ها و پاسخ‌های اندپوینت‌ها، نام استاد منحصراً:
   «حجت الاسلام دکتر زنجیر زن حسینی»
2. **پیام خطای ثبت‌نام مجدد:**
   «شما پیش از این در دوره «{course_title}» ثبت‌نام کرده‌اید و جلسات دوره برای شما در دسترس است.»
3. **پرهیز از اسلاپ و افعال اداری:** هیچ‌کدام از کدهای خطا یا پاسخ‌های API نباید شامل «می‌باشد»، «می‌گردد»، «به شمار می‌رود» باشد؛ منحصراً از افعال طبیعی «است» و «شد» استفاده می‌شود.

---

## ۵. چک‌لیست اعتبارسنجی برای کارگر پیاده‌سازی (Verification Checklist)

- [ ] اجرای تست `backend/tests/test_in_memory.py` با دستور:
  `backend/.venv/Scripts/python.exe backend/tests/test_in_memory.py`
  و تایید پاس شدن ۱۰۰٪ تمام آزمون‌ها.
- [ ] اجرای آزمون خط لوله بازرسی پروژه:
  `backend/.venv/Scripts/python.exe audit_pipeline.py`
  و تایید کسب امتیاز ۱۰۰ از ۱۰۰.
- [ ] تست ثبت‌نام موفق `POST /courses/{id}/enroll` و تایید درج در SQLite.
- [ ] تست ثبت‌نام تکراری و بازگشت HTTP 400 با پیام فارسی دقیق.
- [ ] تست واکشی `GET /courses/enrolled` و بازگشت لیست دوره‌های فعال.
- [ ] تست ثبت سفارش سبد خرید `POST /orders/create` با آیتم دوره و تایید فعال‌سازی خودکار دوره برای کاربر.
- [ ] تست `GET /auth/me` و بررسی وجود `enrolled_course_ids` و صحت شمارش `enrolled_courses_count`.
