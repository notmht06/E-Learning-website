# -*- coding: utf-8 -*-
"""
🎙️ سامانه پرسرعت هوش مصنوعی ارتقای کیفیت، حذف نویز و شفاف‌سازی استودیویی صوت‌های دروس (RNNoise Turbo Multi-Worker)
استاد: حجت الاسلام دکتر زنجیرزن حسینی
اجرا روی دیتاسنتر ابری گوگل کولب با پردازش چندرشته‌ای (Multi-Processing Worker Pool) و بافر سریع NVMe محلی
حساب مقصد: mahdin.dev@gmail.com
"""

import os
import sys
import time
import shutil
import subprocess
from pathlib import Path
from concurrent.futures import ProcessPoolExecutor, as_completed

# ۱. اتصال به گوگل درایو
try:
    from google.colab import drive
    print("⚡ در حال بررسی اتصال گوگل درایو...")
    drive.mount('/content/drive')
    SOURCE_BASE = '/content/drive/MyDrive/Dorus_Ostad_Zanjirzan'
    TARGET_BASE = '/content/drive/MyDrive/Dorus_Ostad_Zanjirzan_Enhanced'
except Exception:
    SOURCE_BASE = './Dorus_Ostad_Zanjirzan'
    TARGET_BASE = './Dorus_Ostad_Zanjirzan_Enhanced'

os.makedirs(TARGET_BASE, exist_ok=True)
TEMP_WORK_DIR = '/tmp/audio_worker'
os.makedirs(TEMP_WORK_DIR, exist_ok=True)

print(f"📁 پوشه صوت‌های اصلی در درایو:\n   {SOURCE_BASE}")
print(f"✨ پوشه ذخیره صوت‌های ارتقایافته با هوش مصنوعی:\n   {TARGET_BASE}")
print(f"⚡ بافر محلی فوق سریع NVMe/RAM:\n   {TEMP_WORK_DIR}\n")

# ۲. بارگذاری مدل هوش مصنوعی شبکه عصبی RNNoise
RNNOISE_MODEL = '/tmp/rnnoise_model.rnnn'
if not (os.path.exists(RNNOISE_MODEL) and os.path.getsize(RNNOISE_MODEL) > 1000):
    print("🧠 دانلود مدل شبکه عصبی گفتار RNNoise...")
    subprocess.run([
        "wget", "-q",
        "https://raw.githubusercontent.com/GregorR/rnnoise-models/master/somnolent-hogwash-2018-09-01/sh.rnnn",
        "-O", RNNOISE_MODEL
    ])

has_rnnoise = os.path.exists(RNNOISE_MODEL) and os.path.getsize(RNNOISE_MODEL) > 1000
if has_rnnoise:
    print(f"✅ مدل شبکه عصبی RNNoise مستقر شد: {RNNOISE_MODEL}")
else:
    print("ℹ️ استفاده از فیلتر تبدیل فوریه فرکانسی با رهگیری نویز کف (afftdn)")


def _worker_task(args):
    """
    پردازش موازی هر فایل در یک پروسس مجزا با بافر محلی NVMe:
    ۱. بررسی وجود فایل در درایو مقصد (Skip if exists)
    ۲. انتقال سریع فایل ورودی به NVMe محلی دیتاسنتر
    ۳. اعمال فیلترهای استودیویی FFmpeg با نهایت سرعت بدون تاخیر شبکه
    ۴. انتقال فایل بهینه‌شده به پوشه گوگل درایو
    ۵. آزادسازی حافظه موقت
    """
    src_file, dst_file, worker_id = args
    base_name = os.path.splitext(os.path.basename(src_file))[0]
    
    # پرش در صورت وجود فایل با حجم معتبر
    if os.path.exists(dst_file) and os.path.getsize(dst_file) > 100 * 1024:
        return {"status": "SKIPPED", "file": base_name, "time": 0}
        
    start_t = time.time()
    ext = os.path.splitext(src_file)[1]
    local_in = os.path.join(TEMP_WORK_DIR, f"in_w{worker_id}_{os.getpid()}{ext}")
    local_out = os.path.join(TEMP_WORK_DIR, f"out_w{worker_id}_{os.getpid()}.mp3")
    
    try:
        # کپی فایل ورودی به NVMe محلی (جلوگیری از تاخیر شبکه Drive)
        shutil.copyfile(src_file, local_in)
        
        # فیلتر شبکه عصبی حذف نویز + نرمالایزر داینامیک بلندی صدا
        if has_rnnoise:
            audio_filter = f"highpass=f=75,arnndn=m={RNNOISE_MODEL}:mix=0.88,dynaudnorm=f=200:g=11:m=10"
        else:
            audio_filter = "highpass=f=75,afftdn=nr=18:nf=-35:tn=enabled,dynaudnorm=f=200:g=11:m=10"
            
        cmd = [
            "ffmpeg", "-y", "-i", local_in,
            "-af", audio_filter,
            "-codec:a", "libmp3lame", "-b:a", "192k", "-ar", "48000",
            local_out
        ]
        res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
        if res.returncode != 0:
            # فال‌بک امن
            cmd_fb = [
                "ffmpeg", "-y", "-i", local_in,
                "-af", "highpass=f=75,afftdn=nf=-25,dynaudnorm=f=200:g=11",
                "-codec:a", "libmp3lame", "-b:a", "192k", "-ar", "48000",
                local_out
            ]
            subprocess.run(cmd_fb, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            
        if os.path.exists(local_out) and os.path.getsize(local_out) > 50 * 1024:
            # انتقال فایل نهایی به گوگل درایو
            shutil.copyfile(local_out, dst_file)
            elapsed = time.time() - start_t
            size_mb = os.path.getsize(dst_file) / (1024 * 1024)
            return {"status": "SUCCESS", "file": base_name, "time": elapsed, "size_mb": size_mb}
        else:
            return {"status": "FAILED", "file": base_name, "error": "خروجی نامعتبر"}
    except Exception as e:
        return {"status": "FAILED", "file": base_name, "error": str(e)}
    finally:
        # پاکسازی کش محلی
        for tmp in (local_in, local_out):
            if os.path.exists(tmp):
                try:
                    os.remove(tmp)
                except Exception:
                    pass


def process_course_parallel(cat_name, course_name, max_workers=None):
    if max_workers is None:
        max_workers = max(1, os.cpu_count() or 2)

    src_dir = os.path.join(SOURCE_BASE, cat_name, course_name)
    dst_dir = os.path.join(TARGET_BASE, cat_name, course_name)
    os.makedirs(dst_dir, exist_ok=True)
    
    if not os.path.exists(src_dir):
        print(f"   ⚠️ پوشه مبدا یافت نشد: {src_dir}")
        return
        
    files = sorted([f for f in os.listdir(src_dir) if f.lower().endswith(('.mp3', '.wav', '.m4a', '.ogg'))])
    if not files:
        print(f"   ℹ️ هیچ فایل صوتی در این پوشه وجود ندارد.")
        return
        
    print(f"\n" + "="*70)
    print(f"🎙️ ارتقای چندرشته‌ای هوش مصنوعی: {course_name} ({len(files)} جلسه)")
    print(f"   📂 مسیر درایو: {cat_name}/{course_name} | ⚙️ ورکر همزمان: {max_workers}")
    print("="*70)
    
    tasks = []
    for idx, fname in enumerate(files):
        src_file = os.path.join(src_dir, fname)
        base_name = os.path.splitext(fname)[0]
        dst_file = os.path.join(dst_dir, f"{base_name}.mp3")
        tasks.append((src_file, dst_file, idx % max_workers))
        
    course_start = time.time()
    success_count = 0
    skipped_count = 0
    
    with ProcessPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(_worker_task, t): t for t in tasks}
        for future in as_completed(futures):
            res = future.result()
            if res["status"] == "SKIPPED":
                skipped_count += 1
                print(f"   ⏩ [قبلاً انجام شده]: {res['file']}.mp3")
            elif res["status"] == "SUCCESS":
                success_count += 1
                print(f"   ✨ [تکمیل شد]: {res['file']}.mp3 ({res['size_mb']:.1f} MB) | زمان: {res['time']:.1f}s")
            else:
                print(f"   ❌ [خطا در پردازش]: {res['file']} -> {res.get('error')}")
                
    total_time = time.time() - course_start
    print(f"🏁 پایان دوره {course_name}: {success_count} ارتقایافته، {skipped_count} ردشده | زمان کل: {total_time:.1f} ثانیه")


COURSES_CATALOG = [
    {
        "category": "01_منطق",
        "courses": [
            {"title": "مبادی_منطق"},
            {"title": "منطق_مظفر_مادی"},
            {"title": "حاشیه_ملاعبدالله"},
            {"title": "جوهر_النضید"},
            {"title": "منطق_مظفر_صوری"}
        ]
    },
    {
        "category": "02_فلسفه",
        "courses": [
            {"title": "مبانی_حکمت"},
            {"title": "الاشارات_و_التنبیهات_۱۰_نمط"},
            {"title": "الشواهد_الربوبیه_سال_اول"},
            {"title": "الشواهد_الربوبیه_سال_دوم"},
            {"title": "منظومه_حکمت"},
            {"title": "بدایه_الحکمه"},
            {"title": "نهایه_الحکمه_جلد۱"},
            {"title": "نهایه_الحکمه_جلد۲"},
            {"title": "فلسفه_غرب"},
            {"title": "حکمت_اشراق"},
            {"title": "الاسفار_الاربعه_جلد۱_سال_اول"},
            {"title": "الاسفار_الاربعه_جلد۱_سال_دوم"},
            {"title": "خلاصه_نهایه_الحکمه_جلد۱"},
            {"title": "بدایه_الحکمه_با_تفکر_آزاد"},
            {"title": "الهیات_شفا_سال_اول"}
        ]
    },
    {
        "category": "03_کلام",
        "courses": [
            {"title": "تجرید_الاعتقاد_کشف_المراد"}
        ]
    },
    {
        "category": "04_عرفان_نظری",
        "courses": [
            {"title": "مبانی_عرفان"},
            {"title": "تمهید_القواعد"},
            {"title": "مقدمه_قیصری_بر_فصوص_الحکم"},
            {"title": "فصوص_الحکم_سال_اول"},
            {"title": "فصوص_الحکم_سال_دوم"},
            {"title": "فصوص_الحکم_سال_سوم"}
        ]
    },
    {
        "category": "05_عرفان_عملی",
        "courses": [
            {"title": "منازل_السائرین"},
            {"title": "اوصاف_الاشراف"}
        ]
    },
    {
        "category": "06_تفسیر",
        "courses": [
            {"title": "تفسیر_سوره_حمد_صدرالمتألهین"},
            {"title": "تفسیر_عرفانی_و_انفسی_سوره_بقره"}
        ]
    },
    {
        "category": "07_اصول",
        "courses": [
            {"title": "حلقه_ثالثه_بخش_۱"},
            {"title": "رسائل_۱_قطع_و_ظن"},
            {"title": "رسائل_۲_حجیت_خبر_واحد"},
            {"title": "انسداد_رسائل"},
            {"title": "رسائل_۳_شبهه_وجوبیه"},
            {"title": "رسائل_۴_فیما_یعتبر"},
            {"title": "رسائل_۵_شروط_استصحاب"},
            {"title": "اقوال_استصحاب_رسائل"},
            {"title": "کفایه_الاصول_۱"},
            {"title": "کفایه_الاصول_۲"},
            {"title": "کفایه_الاصول_۴"},
            {"title": "کفایه_الاصول_۳"}
        ]
    },
    {
        "category": "08_فقه",
        "courses": [
            {"title": "مکاسب_۶_خیار_عیب"},
            {"title": "مکاسب_۱_مکاسب_محرمه"},
            {"title": "مکاسب_۳_شروط_المتعاقدین"}
        ]
    }
]

def get_all_courses_flat():
    flat = []
    for cat in COURSES_CATALOG:
        for c in cat["courses"]:
            flat.append((cat["category"], c["title"]))
    return flat

def main():
    workers = max(1, os.cpu_count() or 2)
    all_courses = get_all_courses_flat()
    
    while True:
        print("="*70)
        print(f"⚡ سامانه شتاب‌دهنده هوش مصنوعی ارتقای کیفیت صوت (تعداد هسته‌ها: {workers})")
        print("   [1] ارتقای خودکار تمام دوره‌ها (پردازش چندرشته‌ای موازی)")
        print(f"   [2] اجرای بخش اول: دوره‌های ۱ تا ۲۲ (منطق، فلسفه، کلام - برای کولب)")
        print(f"   [3] اجرای بخش دوم: دوره‌های ۲۳ تا ۴۶ (عرفان، تفسیر، اصول، فقه - برای کگل)")
        print("   [4] انتخاب یک شاخه علمی مشخص (مثلاً منطق یا اصول)")
        print("   [5] انتخاب یک دوره مشخص از میان کل دوره‌ها")
        print("   [6] تست روی یک فایل تکی همراه با خروجی صوتی")
        print("   [7] خروج")
        print("="*70)
        choice = input("👉 لطفاً گزینه مورد نظر را انتخاب کنید (1 تا 7): ").strip()
        
        if choice == "1":
            print(f"\n🚀 آغاز فرآیند ارتقای تمام {len(all_courses)} دوره به صورت موازی...")
            for cat_name, course_title in all_courses:
                process_course_parallel(cat_name, course_title, max_workers=workers)
            print("\n🎉 تمام دوره‌ها با موفقیت ارتقا یافتند!")
            break
            
        elif choice == "2":
            half1 = all_courses[:22]
            print(f"\n🚀 آغاز فرآیند بخش اول ({len(half1)} دوره: منطق، فلسفه و کلام)...")
            for cat_name, course_title in half1:
                process_course_parallel(cat_name, course_title, max_workers=workers)
            print("\n🎉 بخش اول با موفقیت تکمیل شد!")
            break
            
        elif choice == "3":
            half2 = all_courses[22:]
            print(f"\n🚀 آغاز فرآیند بخش دوم ({len(half2)} دوره: عرفان، تفسیر، اصول، فقه)...")
            for cat_name, course_title in half2:
                process_course_parallel(cat_name, course_title, max_workers=workers)
            print("\n🎉 بخش دوم با موفقیت تکمیل شد!")
            break
            
        elif choice == "4":
            print("\nفهرست شاخه‌های علمی:")
            for i, cat in enumerate(COURSES_CATALOG, 1):
                print(f"   [{i}] {cat['category']} ({len(cat['courses'])} دوره)")
            cat_idx = int(input("شماره شاخه را وارد کنید: ").strip()) - 1
            sel_cat = COURSES_CATALOG[cat_idx]
            print(f"\n🚀 شروع ارتقای شاخه {sel_cat['category']}...")
            for c in sel_cat["courses"]:
                process_course_parallel(sel_cat["category"], c["title"], max_workers=workers)
            print(f"\n🎉 ارتقای شاخه {sel_cat['category']} به پایان رسید.")
            
        elif choice == "5":
            print(f"\nفهرست کل {len(all_courses)} دوره:")
            for idx, (cat_name, course_title) in enumerate(all_courses, 1):
                print(f"   [{idx:02d}] {course_title} ({cat_name})")
            c_num = int(input("\nشماره دوره را وارد کنید: ").strip()) - 1
            cat_name, course_title = all_courses[c_num]
            process_course_parallel(cat_name, course_title, max_workers=workers)
            print(f"\n🎉 ارتقای دوره {course_title} به پایان رسید.")
            
        elif choice == "6":
            print("\nجستجوی فایل صوتی برای تست کیفیت...")
            sample_file = None
            for cat_name, course_title in all_courses:
                dir_p = os.path.join(SOURCE_BASE, cat_name, course_title)
                if os.path.exists(dir_p):
                    audios = [f for f in os.listdir(dir_p) if f.lower().endswith(('.mp3', '.wav', '.m4a'))]
                    if audios:
                        sample_file = os.path.join(dir_p, audios[0])
                        break
                if sample_file:
                    break
            
            if not sample_file:
                print("❌ فایل صوتی یافت نشد.")
                continue
                
            out_test = os.path.join(TEMP_WORK_DIR, "test_enhanced.mp3")
            print(f"🎧 فایل تست: {os.path.basename(sample_file)}")
            print("⏳ در حال ارتقا...")
            res = _worker_task((sample_file, out_test, 0))
            print(f"✅ نتیجه: {res}")
            try:
                from IPython.display import Audio, display
                print("🔊 صدای ارتقایافته استودیویی:")
                display(Audio(out_test))
            except Exception:
                pass
                
        elif choice == "7":
            print("خروج از سامانه.")
            break

if __name__ == "__main__":
    main()
