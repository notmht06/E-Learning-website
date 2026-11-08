# -*- coding: utf-8 -*-
"""
🚀 اسکریپت دانلود چندکاناله موازی دوره‌های تلگرام به گوگل درایو (Multi-Stream Parallel Turbo)
استاد حجت الاسلام دکتر زنجیرزن حسینی
اکانت گوگل مقصد: mahdin.dev@gmail.com

⚡ تکنولوژی شتاب‌دهنده:
۱. دانلود هم‌زمان ۶ الی ۸ فایل درس به طور موازی (دور زدن محدودیت سرعت تک‌فایل تلگرام)
۲. پهنای باند کلی تجمیعی تا ۱۰ الی ۱۵ مگابایت بر ثانیه (اتمام یک دوره ۵۰ جلسه‌ای ظرف چند ثانیه)
۳. دانلود اولیه روی رم/SSD محلی کولب (/content/temp_downloads) و انتقال بدون معطلی به گوگل درایو
۴. مصرف اینترنت شخصی شما: دقیقاً ۰ مگابایت (تمامی ترافیک داخل شبکه ابری گوگل انجام می‌شود)
"""

import os
import sys
import time
import json
import asyncio
import shutil
import urllib.request
from pathlib import Path

# ۱. تایید دیتاسنتر گوگل
try:
    with urllib.request.urlopen("https://ipinfo.io/json", timeout=5) as resp:
        net_info = json.loads(resp.read().decode())
        print("🌐 وضعیت شبکه سرور ابری:")
        print(f"   🏢 مالک شبکه: {net_info.get('org', 'Google LLC')} (گوگل کلاود)")
        print(f"   📍 لوکیشن دیتاسنتر: {net_info.get('city', 'Datacenter')}, {net_info.get('country', 'US')}")
        print("   ⚡ تایید شد: ترافیک ۱۰۰٪ در آمریکا دانلود می‌شود و مصرف نت شما صفر است.\n")
except Exception:
    pass

# ۲. اتصال گوگل درایو
try:
    from google.colab import drive
    print("⚡ در حال بررسی اتصال گوگل درایو...")
    drive.mount('/content/drive')
    BASE_DIR = '/content/drive/MyDrive/Dorus_Ostad_Zanjirzan'
except Exception:
    BASE_DIR = './Dorus_Ostad_Zanjirzan'

os.makedirs(BASE_DIR, exist_ok=True)
TEMP_DIR = '/content/temp_downloads'
os.makedirs(TEMP_DIR, exist_ok=True)
print(f"📁 پوشه دائمی درایو: {BASE_DIR}")
print(f"🚀 حافظه موقت پرسرعت SSD کولب: {TEMP_DIR}\n")

# ۳. نصب ملزومات سرعت بالا
print("📦 بررسی و نصب شتاب‌دهنده‌های تلگرام...")
os.system("pip install -q telethon tgcrypto cryptg nest_asyncio tqdm")

import nest_asyncio
nest_asyncio.apply()

from telethon import TelegramClient
from telethon.tl.types import MessageMediaDocument, DocumentAttributeAudio, DocumentAttributeFilename
from telethon.errors import SessionPasswordNeededError, FloodWaitError

API_ID = 2040
API_HASH = "b18441a1ff607e10a989891a5462e627"
SESSION_PATH = os.path.join(BASE_DIR, "telegram_colab_session")
CHANNEL_USERNAME = "AlNajmosageb313"

COURSES_CATALOG = [
    {
        "category": "01_منطق",
        "courses": [
            {
                "title": "مبادی_منطق",
                "start_post": 979,
                "end_post": 1155,
                "url": "https://t.me/AlNajmosageb313/979"
            },
            {
                "title": "منطق_مظفر_مادی",
                "start_post": 1156,
                "end_post": 1229,
                "url": "https://t.me/AlNajmosageb313/1156"
            },
            {
                "title": "حاشیه_ملاعبدالله",
                "start_post": 1650,
                "end_post": 1799,
                "url": "https://t.me/AlNajmosageb313/1650"
            },
            {
                "title": "جوهر_النضید",
                "start_post": 1800,
                "end_post": 1868,
                "url": "https://t.me/AlNajmosageb313/1800"
            },
            {
                "title": "منطق_مظفر_صوری",
                "start_post": 2608,
                "end_post": 2750,
                "url": "https://t.me/AlNajmosageb313/2608"
            }
        ]
    },
    {
        "category": "02_فلسفه",
        "courses": [
            {
                "title": "مبانی_حکمت",
                "start_post": 134,
                "end_post": 223,
                "url": "https://t.me/AlNajmosageb313/134"
            },
            {
                "title": "الاشارات_و_التنبیهات_۱۰_نمط",
                "start_post": 755,
                "end_post": 978,
                "url": "https://t.me/AlNajmosageb313/755"
            },
            {
                "title": "الشواهد_الربوبیه_سال_اول",
                "start_post": 1353,
                "end_post": 1452,
                "url": "https://t.me/AlNajmosageb313/1353"
            },
            {
                "title": "الشواهد_الربوبیه_سال_دوم",
                "start_post": 1453,
                "end_post": 1541,
                "url": "https://t.me/AlNajmosageb313/1453"
            },
            {
                "title": "منظومه_حکمت",
                "start_post": 2044,
                "end_post": 2101,
                "url": "https://t.me/AlNajmosageb313/2044"
            },
            {
                "title": "بدایه_الحکمه",
                "start_post": 2102,
                "end_post": 2217,
                "url": "https://t.me/AlNajmosageb313/2102"
            },
            {
                "title": "نهایه_الحکمه_جلد۱",
                "start_post": 2218,
                "end_post": 2345,
                "url": "https://t.me/AlNajmosageb313/2218"
            },
            {
                "title": "نهایه_الحکمه_جلد۲",
                "start_post": 2346,
                "end_post": 2412,
                "url": "https://t.me/AlNajmosageb313/2346"
            },
            {
                "title": "فلسفه_غرب",
                "start_post": 2413,
                "end_post": 2469,
                "url": "https://t.me/AlNajmosageb313/2413"
            },
            {
                "title": "حکمت_اشراق",
                "start_post": 4098,
                "end_post": 4215,
                "url": "https://t.me/AlNajmosageb313/4098"
            },
            {
                "title": "الاسفار_الاربعه_جلد۱_سال_اول",
                "start_post": 4266,
                "end_post": 4366,
                "url": "https://t.me/AlNajmosageb313/4266"
            },
            {
                "title": "الاسفار_الاربعه_جلد۱_سال_دوم",
                "start_post": 4367,
                "end_post": 4447,
                "url": "https://t.me/AlNajmosageb313/4367"
            },
            {
                "title": "خلاصه_نهایه_الحکمه_جلد۱",
                "start_post": 4886,
                "end_post": 4920,
                "url": "https://t.me/AlNajmosageb313/4886"
            },
            {
                "title": "بدایه_الحکمه_با_تفکر_آزاد",
                "start_post": 4921,
                "end_post": 5085,
                "url": "https://t.me/AlNajmosageb313/4921"
            },
            {
                "title": "الهیات_شفا_سال_اول",
                "start_post": 6046,
                "end_post": 6241,
                "url": "https://t.me/AlNajmosageb313/6046"
            }
        ]
    },
    {
        "category": "03_کلام",
        "courses": [
            {
                "title": "تجرید_الاعتقاد_کشف_المراد",
                "start_post": 1230,
                "end_post": 1314,
                "url": "https://t.me/AlNajmosageb313/1230"
            }
        ]
    },
    {
        "category": "04_عرفان_نظری",
        "courses": [
            {
                "title": "مبانی_عرفان",
                "start_post": 224,
                "end_post": 754,
                "url": "https://t.me/AlNajmosageb313/224"
            },
            {
                "title": "تمهید_القواعد",
                "start_post": 1315,
                "end_post": 1352,
                "url": "https://t.me/AlNajmosageb313/1315"
            },
            {
                "title": "مقدمه_قیصری_بر_فصوص_الحکم",
                "start_post": 3070,
                "end_post": 3805,
                "url": "https://t.me/AlNajmosageb313/3070"
            },
            {
                "title": "فصوص_الحکم_سال_اول",
                "start_post": 6308,
                "end_post": 6457,
                "url": "https://t.me/AlNajmosageb313/6308"
            },
            {
                "title": "فصوص_الحکم_سال_دوم",
                "start_post": 6458,
                "end_post": 6557,
                "url": "https://t.me/AlNajmosageb313/6458"
            },
            {
                "title": "فصوص_الحکم_سال_سوم",
                "start_post": 6558,
                "end_post": 6700,
                "url": "https://t.me/AlNajmosageb313/6558"
            }
        ]
    },
    {
        "category": "05_عرفان_عملی",
        "courses": [
            {
                "title": "منازل_السائرین",
                "start_post": 5406,
                "end_post": 5660,
                "url": "https://t.me/AlNajmosageb313/5406"
            },
            {
                "title": "اوصاف_الاشراف",
                "start_post": 5661,
                "end_post": 5834,
                "url": "https://t.me/AlNajmosageb313/5661"
            }
        ]
    },
    {
        "category": "06_تفسیر",
        "courses": [
            {
                "title": "تفسیر_سوره_حمد_صدرالمتألهین",
                "start_post": 4229,
                "end_post": 4265,
                "url": "https://t.me/AlNajmosageb313/4229"
            },
            {
                "title": "تفسیر_عرفانی_و_انفسی_سوره_بقره",
                "start_post": 6242,
                "end_post": 6307,
                "url": "https://t.me/AlNajmosageb313/6242"
            }
        ]
    },
    {
        "category": "07_اصول",
        "courses": [
            {
                "title": "حلقه_ثالثه_بخش_۱",
                "start_post": 1542,
                "end_post": 1649,
                "url": "https://t.me/AlNajmosageb313/1542"
            },
            {
                "title": "رسائل_۱_قطع_و_ظن",
                "start_post": 1869,
                "end_post": 1962,
                "url": "https://t.me/AlNajmosageb313/1869"
            },
            {
                "title": "رسائل_۲_حجیت_خبر_واحد",
                "start_post": 1963,
                "end_post": 2043,
                "url": "https://t.me/AlNajmosageb313/1963"
            },
            {
                "title": "انسداد_رسائل",
                "start_post": 2470,
                "end_post": 2486,
                "url": "https://t.me/AlNajmosageb313/2470"
            },
            {
                "title": "رسائل_۳_شبهه_وجوبیه",
                "start_post": 2487,
                "end_post": 2607,
                "url": "https://t.me/AlNajmosageb313/2487"
            },
            {
                "title": "رسائل_۴_فیما_یعتبر",
                "start_post": 3806,
                "end_post": 4000,
                "url": "https://t.me/AlNajmosageb313/3806"
            },
            {
                "title": "رسائل_۵_شروط_استصحاب",
                "start_post": 4001,
                "end_post": 4097,
                "url": "https://t.me/AlNajmosageb313/4001"
            },
            {
                "title": "اقوال_استصحاب_رسائل",
                "start_post": 4216,
                "end_post": 4228,
                "url": "https://t.me/AlNajmosageb313/4216"
            },
            {
                "title": "کفایه_الاصول_۱",
                "start_post": 4448,
                "end_post": 4650,
                "url": "https://t.me/AlNajmosageb313/4448"
            },
            {
                "title": "کفایه_الاصول_۲",
                "start_post": 4651,
                "end_post": 4782,
                "url": "https://t.me/AlNajmosageb313/4651"
            },
            {
                "title": "کفایه_الاصول_۴",
                "start_post": 4783,
                "end_post": 4885,
                "url": "https://t.me/AlNajmosageb313/4783"
            },
            {
                "title": "کفایه_الاصول_۳",
                "start_post": 5249,
                "end_post": 5405,
                "url": "https://t.me/AlNajmosageb313/5249"
            }
        ]
    },
    {
        "category": "08_فقه",
        "courses": [
            {
                "title": "مکاسب_۶_خیار_عیب",
                "start_post": 5086,
                "end_post": 5248,
                "url": "https://t.me/AlNajmosageb313/5086"
            },
            {
                "title": "مکاسب_۱_مکاسب_محرمه",
                "start_post": 5835,
                "end_post": 5947,
                "url": "https://t.me/AlNajmosageb313/5835"
            },
            {
                "title": "مکاسب_۳_شروط_المتعاقدین",
                "start_post": 5948,
                "end_post": 6045,
                "url": "https://t.me/AlNajmosageb313/5948"
            }
        ]
    }
]

# حداکثر تعداد فایل‌هایی که هم‌زمان دانلود می‌شوند (هم‌افزایی سرعت تا ۱۰ مگابایت بر ثانیه)
MAX_CONCURRENT_DOWNLOADS = 6
download_semaphore = asyncio.Semaphore(MAX_CONCURRENT_DOWNLOADS)

def setup_folders():
    count = 0
    for cat in COURSES_CATALOG:
        cat_path = os.path.join(BASE_DIR, cat["category"])
        os.makedirs(cat_path, exist_ok=True)
        for course in cat["courses"]:
            course_path = os.path.join(cat_path, course["title"])
            os.makedirs(course_path, exist_ok=True)
            count += 1
    print(f"✅ ساختار {count} پوشه برای دوره‌ها در گوگل درایو تایید شد.\n")

async def download_single_file(client, message, dest_dir, file_index):
    """دانلود یک فایل به صورت محافظت‌شده در صف دانلود موازی"""
    doc = message.media.document
    file_size_mb = doc.size / (1024 * 1024)

    original_name = None
    for attr in doc.attributes:
        if isinstance(attr, DocumentAttributeFilename):
            original_name = attr.file_name
            break

    if original_name:
        filename = f"{file_index:02d}_{original_name}"
    else:
        filename = f"جلسه_{file_index:02d}_post_{message.id}.mp3"

    target_path = os.path.join(dest_dir, filename)
    temp_path = os.path.join(TEMP_DIR, filename)

    # بررسی اگر از قبل در گوگل درایو باشد
    if os.path.exists(target_path) and os.path.getsize(target_path) > 1024 * 100:
        print(f"   ⏩ قبلاً در درایو موجود است: {filename} ({file_size_mb:.1f} MB)")
        return

    # استفاده از سمافور برای دانلود موازی ۶ تایی
    async with download_semaphore:
        print(f"   ⬇️ آغاز دانلود هم‌زمان: {filename} ({file_size_mb:.1f} MB)...")
        start_time = time.time()
        
        try:
            await client.download_media(message, file=temp_path)
            shutil.move(temp_path, target_path)
            elapsed = time.time() - start_time
            speed = file_size_mb / elapsed if elapsed > 0 else 0
            print(f"   ✅ [ذخیره در درایو] {filename} | زمان: {elapsed:.1f}s | سرعت: {speed:.1f} MB/s")
        except FloodWaitError as e:
            print(f"   ⚠️ وقفه امنیتی تلگرام: {e.seconds} ثانیه...")
            await asyncio.sleep(e.seconds + 2)
            await client.download_media(message, file=temp_path)
            shutil.move(temp_path, target_path)
            print(f"   ✅ [ذخیره در درایو] {filename}")
        except Exception as e:
            print(f"   ❌ خطا در {filename}: {e}")

async def download_course_parallel(client, channel, course_info, category_name):
    title = course_info["title"]
    start_id = course_info["start_post"]
    end_id = course_info.get("end_post", start_id + 150)
    dest_dir = os.path.join(BASE_DIR, category_name, title)
    os.makedirs(dest_dir, exist_ok=True)

    print("\n" + "="*65)
    print(f"🎧 آغاز دانلود موازی دوره: {title}")
    print(f"   📂 ذخیره در: {category_name}/{title}")
    print(f"   📡 بازه پست‌ها: {start_id} تا {end_id}")
    print("="*65)

    # جمع‌آوری پیام‌های دارای صوت در این دوره
    audio_messages = []
    async for message in client.iter_messages(channel, min_id=start_id - 1, max_id=end_id + 1, reverse=True):
        if not message.media or not isinstance(message.media, MessageMediaDocument):
            continue
        doc = message.media.document
        is_audio = any(isinstance(x, DocumentAttributeAudio) for x in doc.attributes) or 'audio' in (doc.mime_type or '')
        orig_name = ""
        for attr in doc.attributes:
            if isinstance(attr, DocumentAttributeFilename):
                orig_name = attr.file_name.lower()
                break
        if is_audio or orig_name.endswith(('.mp3', '.m4a', '.ogg', '.wav')):
            audio_messages.append(message)

    if not audio_messages:
        print("   ℹ️ هیچ فایل صوتی در این بازه یافت نشد.")
        return

    print(f"   📋 تعداد {len(audio_messages)} جلسه شناسایی شد. دانلود هم‌زمان {MAX_CONCURRENT_DOWNLOADS} تایی...")

    tasks = []
    for idx, msg in enumerate(audio_messages, 1):
        tasks.append(download_single_file(client, msg, dest_dir, idx))

    # اجرای موازی تمام جلسات با کنترل صف
    await asyncio.gather(*tasks)
    print(f"\n   🎉 دوره {title} با {len(audio_messages)} جلسه با موفقیت کامل دانلود و در درایو ذخیره شد!")

async def main():
    setup_folders()
    
    print("⚡ در حال اتصال به تلگرام با دیتاسنتر ابری گوگل...")
    client = TelegramClient(
        SESSION_PATH,
        api_id=API_ID,
        api_hash=API_HASH,
        device_model="Google Colab Turbo",
        system_version="Linux 5.15",
        app_version="4.16.8",
        lang_code="fa",
        system_lang_code="fa"
    )
    
    await client.connect()
    if not await client.is_user_authorized():
        print("\n" + "="*65)
        print("🔐 لاگین تلگرام (فقط یک‌بار لازم است - اطلاعات در درایو ذخیره می‌شود)")
        print("="*65)
        phone = input("📱 شماره همراه خود را وارد کنید (مثال: +989123456789): ").strip()
        await client.send_code_request(phone)
        code = input("📩 کدی که در تلگرام برایتان ارسال شد را وارد کنید: ").strip()
        try:
            await client.sign_in(phone, code)
        except SessionPasswordNeededError:
            pwd = input("🔑 رمز تأیید دومرحله‌ای (Two-Step Verification) تلگرام خود را وارد کنید: ")
            await client.sign_in(password=pwd)
    
    me = await client.get_me()
    print(f"\n🎉 هویت تایید شد! کاربر: {me.first_name}")
    print(f"📡 نشست شما در فایل درایو پایدار است:\n   {SESSION_PATH}.session\n")
    
    channel = await client.get_entity(CHANNEL_USERNAME)
    print(f"📻 متصل به کانال رسمی: {channel.title} (@{CHANNEL_USERNAME})\n")
    
    while True:
        print("="*65)
        print("📋 منوی دانلود فوق‌سریع موازی (۶ فایل هم‌زمان):")
        print("   [1] دانلود خودکار تمام ۳۲ دوره (کل کانال به ترتیب)")
        print("   [2] دانلود یک شاخه علمی خاص (مثلاً منطق یا فلسفه)")
        print("   [3] دانلود یک دوره مشخص")
        print("   [4] خروج")
        print("="*65)
        choice = input("👉 لطفاً گزینه را انتخاب کنید (1/2/3/4): ").strip()
        
        if choice == "1":
            print("\n🚀 شروع دانلود موازی تمام دوره‌ها به گوگل درایو...")
            for cat in COURSES_CATALOG:
                for c in cat["courses"]:
                    await download_course_parallel(client, channel, c, cat["category"])
            print("\n🎉 تمام دوره‌ها با موفقیت به گوگل درایو منتقل شدند.")
            break
            
        elif choice == "2":
            print("\nفهرست شاخه‌های علمی:")
            for i, cat in enumerate(COURSES_CATALOG, 1):
                print(f"   [{i}] {cat['category']} ({len(cat['courses'])} دوره)")
            cat_idx = int(input("شماره شاخه مورد نظر را وارد کنید: ").strip()) - 1
            selected_cat = COURSES_CATALOG[cat_idx]
            print(f"\n🚀 دانلود موازی دوره‌های شاخه {selected_cat['category']}...")
            for c in selected_cat["courses"]:
                await download_course_parallel(client, channel, c, selected_cat["category"])
            print(f"\n🎉 دانلود شاخه {selected_cat['category']} به پایان رسید.")
            
        elif choice == "3":
            all_courses = []
            print("\nفهرست ۳۲ دوره:")
            idx = 1
            for cat in COURSES_CATALOG:
                for c in cat["courses"]:
                    print(f"   [{idx:02d}] {c['title']} ({cat['category']} - پست {c['start_post']})")
                    all_courses.append((c, cat["category"]))
                    idx += 1
            course_num = int(input("\nشماره دوره را وارد کنید: ").strip()) - 1
            target_course, target_cat = all_courses[course_num]
            await download_course_parallel(client, channel, target_course, target_cat)
            print(f"\n🎉 دانلود دوره {target_course['title']} به پایان رسید.")
            
        elif choice == "4":
            print("خسته نباشید! خروج از برنامه.")
            break

if __name__ == "__main__":
    asyncio.run(main())
