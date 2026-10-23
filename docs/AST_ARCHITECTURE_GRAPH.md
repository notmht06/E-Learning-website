# 🧭 شجره‌نامه و گراف ارتباطی سیستم (Cross-Layer AST Knowledge Graph)

این سند نقشه دوطرفه وابستگی‌های فرانت‌اند و بک‌اند را نمایش می‌دهد تا ایجنت‌ها بدون مصرف توکن اضافه به لایه‌های مرتبط دسترسی داشته باشند.

## ۱. پایگاه مدل‌های پایگاه داده (SQLAlchemy ORM Models)

| مدل ORM | جدول SQLite | تعداد ستون‌ها | روابط کلیدی |
| :--- | :--- | :---: | :--- |
| **Category** | `categories` | 6 | `courses` ➔ Course |
| **Course** | `courses` | 16 | `category` ➔ Category, `lessons` ➔ Lesson, `enrollments` ➔ Enrollment, `favorited_by` ➔ UserFavorite |
| **Lesson** | `lessons` | 9 | `course` ➔ Course |
| **User** | `users` | 10 | `enrollments` ➔ Enrollment, `orders` ➔ Order, `favorites` ➔ UserFavorite |
| **Enrollment** | `enrollments` | 5 | `user` ➔ User, `course` ➔ Course |
| **UserFavorite** | `user_favorites` | 4 | `user` ➔ User, `course` ➔ Course |
| **AnalyticsLog** | `analytics_logs` | 7 | — |
| **Order** | `orders` | 14 | `user` ➔ User, `items` ➔ OrderItem |
| **OrderItem** | `order_items` | 8 | `order` ➔ Order |

## ۲. اندپوینت‌های API v1 و سرویس‌های بک‌اند

| روش | مسیر اندپوینت (Route) | کنترل‌کننده (Handler) | سطح دسترسی | ماژول |
| :---: | :--- | :--- | :---: | :--- |
| `GET` | `/api/v1/admin` | `admin_root()` | 🔒 ادمین | `admin` |
| `GET` | `/api/v1/admin/analytics` | `get_analytics()` | 🔒 ادمین | `admin` |
| `POST` | `/api/v1/admin/courses/create` | `create_course()` | 🔒 ادمین | `admin` |
| `PUT` | `/api/v1/admin/courses/{course_id}` | `update_course()` | 🔒 ادمین | `admin` |
| `POST` | `/api/v1/admin/courses/{course_id}/chapters` | `add_chapter()` | 🔒 ادمین | `admin` |
| `PUT` | `/api/v1/admin/courses/{course_id}/chapters/{chapter_id}` | `update_chapter()` | 🔒 ادمین | `admin` |
| `PUT` | `/api/v1/admin/books/{book_id}` | `update_book()` | 🔒 ادمین | `admin` |
| `PUT` | `/api/v1/admin/orders/{order_id}/status` | `update_order_status()` | 🔒 ادمین | `admin` |
| `DELETE` | `/api/v1/admin/courses/{course_id}` | `delete_course()` | 🔒 ادمین | `admin` |
| `POST` | `/api/v1/admin/upload` | `upload_media()` | 🔒 ادمین | `admin` |
| `POST` | `/api/v1/ai/chat` | `chat_with_assistant()` | عمومی / کاربر | `ai` |
| `POST` | `/api/v1/ai/chat/stream` | `stream_chat_with_assistant()` | عمومی / کاربر | `ai` |
| `POST` | `/api/v1/ai/transcribe` | `transcribe_voice()` | عمومی / کاربر | `ai` |
| `POST` | `/api/v1/ai/analyze-document` | `analyze_document()` | عمومی / کاربر | `ai` |
| `POST` | `/api/v1/auth/register` | `register()` | عمومی / کاربر | `auth` |
| `POST` | `/api/v1/auth/login` | `login()` | عمومی / کاربر | `auth` |
| `POST` | `/api/v1/auth/otp/send` | `send_otp()` | عمومی / کاربر | `auth` |
| `POST` | `/api/v1/auth/otp/verify` | `verify_otp()` | عمومی / کاربر | `auth` |
| `GET` | `/api/v1/auth/me` | `get_me()` | عمومی / کاربر | `auth` |
| `PUT` | `/api/v1/auth/profile` | `update_profile()` | عمومی / کاربر | `auth` |
| `GET` | `/api/v1/books` | `list_books()` | عمومی / کاربر | `books` |
| `GET` | `/api/v1/books/{book_id}` | `get_book()` | عمومی / کاربر | `books` |
| `GET` | `/api/v1/books/{book_id}/sample` | `get_book_sample()` | عمومی / کاربر | `books` |
| `GET` | `/api/v1/cart` | `get_cart()` | عمومی / کاربر | `cart` |
| `POST` | `/api/v1/cart/add` | `add_to_cart()` | عمومی / کاربر | `cart` |
| `DELETE` | `/api/v1/cart/remove/{item_id}` | `remove_from_cart()` | عمومی / کاربر | `cart` |
| `DELETE` | `/api/v1/cart/clear` | `clear_cart()` | عمومی / کاربر | `cart` |
| `POST` | `/api/v1/coupons/validate` | `validate_coupon()` | عمومی / کاربر | `coupons` |
| `GET` | `/api/v1/coupons/list` | `list_coupons()` | عمومی / کاربر | `coupons` |
| `GET` | `/api/v1/courses` | `list_courses()` | عمومی / کاربر | `courses` |
| `GET` | `/api/v1/courses/enrolled` | `get_enrolled_courses()` | عمومی / کاربر | `courses` |
| `GET` | `/api/v1/courses/favorites` | `get_favorite_courses()` | عمومی / کاربر | `courses` |
| `POST` | `/api/v1/courses/{course_id}/enroll` | `enroll_course()` | عمومی / کاربر | `courses` |
| `POST` | `/api/v1/courses/{course_id}/favorite` | `toggle_course_favorite()` | عمومی / کاربر | `courses` |
| `GET` | `/api/v1/courses/{course_id}` | `get_course()` | عمومی / کاربر | `courses` |
| `POST` | `/api/v1/courses/{course_id}/progress` | `sync_progress()` | عمومی / کاربر | `courses` |
| `GET` | `/api/v1/notes` | `get_notes()` | عمومی / کاربر | `notes` |
| `POST` | `/api/v1/notes/create` | `create_note()` | عمومی / کاربر | `notes` |
| `PUT` | `/api/v1/notes/{note_id}` | `update_note()` | عمومی / کاربر | `notes` |
| `DELETE` | `/api/v1/notes/{note_id}` | `delete_note()` | عمومی / کاربر | `notes` |
| `POST` | `/api/v1/orders/create` | `create_order()` | عمومی / کاربر | `orders` |
| `GET` | `/api/v1/orders/{order_id}` | `get_order()` | عمومی / کاربر | `orders` |
| `GET` | `/api/v1/orders/track/{tracking_code}` | `track_shipment()` | عمومی / کاربر | `orders` |
| `POST` | `/api/v1/payment/init` | `initiate_payment()` | عمومی / کاربر | `payment` |
| `POST` | `/api/v1/payment/verify` | `verify_payment()` | عمومی / کاربر | `payment` |
| `GET` | `/api/v1/qa` | `list_discussions()` | 🔒 ادمین | `qa` |
| `POST` | `/api/v1/qa/ask` | `ask_question()` | 🔒 ادمین | `qa` |
| `POST` | `/api/v1/qa/{question_id}/answer` | `answer_question()` | 🔒 ادمین | `qa` |
| `POST` | `/api/v1/stream/token` | `issue_stream_token()` | عمومی / کاربر | `stream` |
| `POST` | `/api/v1/stream/heartbeat` | `verify_heartbeat()` | عمومی / کاربر | `stream` |
| `GET` | `/api/v1/stream/hls/{course_id}/{chapter_id}/master.m3u8` | `get_hls_playlist()` | عمومی / کاربر | `stream` |
| `GET` | `/api/v1/stream/audio/{course_id}/{chapter_id}` | `stream_audio_range()` | عمومی / کاربر | `stream` |

## ۳. کلاینت یکپارچه فرانت‌اند (`apiClient.ts`)

| ماژول کلاینت | متد فراخوانی | پروتکل | اندپوینت مقصد |
| :--- | :--- | :---: | :--- |
| `apiClient.auth` | `.getMe()` | `GET` | `/auth/me` |
| `apiClient.courses` | `.getAll()` | `GET` | `/courses/` |
| `apiClient.courses` | `.getById(courseId: string)` | `GET` | `/courses/${courseId}` |
| `apiClient.courses` | `.getEnrolled()` | `GET` | `/courses/enrolled` |
| `apiClient.books` | `.getAll()` | `GET` | `/books/` |
| `apiClient.books` | `.getById(bookId: string)` | `GET` | `/books/${bookId}` |
| `apiClient.books` | `.getSample(bookId: string)` | `GET` | `/books/${bookId}/sample` |
| `apiClient.cart` | `.get()` | `GET` | `/cart/` |
| `apiClient.orders` | `.getById(orderId: string)` | `GET` | `/orders/${orderId}` |
| `apiClient.orders` | `.track(trackingCode: string)` | `GET` | `/orders/track/${trackingCode}` |
| `apiClient.notes` | `.getAll(courseId?: string)` | `GET` | `/notes/${courseId ? ` |
| `apiClient.qa` | `.getAll(courseId?: string)` | `GET` | `/qa/${courseId ? ` |
| `apiClient.admin` | `.getAnalytics()` | `GET` | `/admin/analytics` |
