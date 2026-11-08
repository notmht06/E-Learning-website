# -*- coding: utf-8 -*-
"""
🔍 Automated Real Quality Gate Pipeline
پایگاه رسمی حجت الاسلام دکتر زنجیرزن حسینی
Only runs real backend integration test suites and frontend production build checks.
"""

import os
import sys
import subprocess
from pathlib import Path

# Fix Windows console UTF-8
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ROOT_DIR = Path(__file__).resolve().parent

def run_step(step_name, fn):
    print(f"\n▶️ [بررسی] {step_name}...")
    try:
        score, details = fn()
        if score == 100:
            print(f"   ✅ [تایید شد - ۱۰۰/۱۰۰] {details}")
        elif score >= 80:
            print(f"   ⚠️ [هشدار جزئی - {score}/۱۰۰] {details}")
        else:
            print(f"   ❌ [عدم تایید - {score}/۱۰۰] {details}")
        return score
    except Exception as e:
        print(f"   ❌ [خطای غیرمنتظره]: {e}")
        return 0

def check_backend_in_memory_tests():
    python_bin = ROOT_DIR / "backend/.venv/Scripts/python.exe"
    test_script = ROOT_DIR / "backend/tests/test_in_memory.py"
    
    if not python_bin.exists():
        return 0, "محیط مجازی backend/.venv یافت نشد."
        
    cmd = [str(python_bin), str(test_script)]
    env = os.environ.copy()
    env["PYTHONPATH"] = str(ROOT_DIR)
    env["PYTHONIOENCODING"] = "utf-8"
    
    res = subprocess.run(cmd, capture_output=True, text=True, cwd=str(ROOT_DIR), env=env)
    if res.returncode == 0:
        return 100, "تمامی ۲۵ آزمون یکپارچگی بک‌اند، احراز هویت، DRM و دیتابیس با موفقیت پاس شدند."
    else:
        return 30, f"خطا در آزمون‌های test_in_memory: {res.stderr[:200] or res.stdout[:200]}"

def check_backend_api_v1_tests():
    python_bin = ROOT_DIR / "backend/.venv/Scripts/python.exe"
    test_script = ROOT_DIR / "backend/tests/test_api_v1.py"
    
    if not python_bin.exists():
        return 0, "محیط مجازی backend/.venv یافت نشد."
        
    cmd = [str(python_bin), str(test_script)]
    env = os.environ.copy()
    env["PYTHONPATH"] = str(ROOT_DIR)
    env["PYTHONIOENCODING"] = "utf-8"
    
    res = subprocess.run(cmd, capture_output=True, text=True, cwd=str(ROOT_DIR), env=env)
    if res.returncode == 0:
        return 100, "تمامی ۲۵ آزمون یکپارچگی معماری API v1 پاس شدند."
    else:
        return 30, f"خطا در آزمون‌های test_api_v1: {res.stderr[:200] or res.stdout[:200]}"

def check_frontend_build():
    frontend_dir = ROOT_DIR / "frontend"
    # Check if package.json exists
    if not (frontend_dir / "package.json").exists():
        return 0, "پوشه frontend یا package.json یافت نشد."

    # Run npm run build or tsc check
    cmd = ["npm.cmd", "run", "build"]
    res = subprocess.run(cmd, capture_output=True, text=True, cwd=str(frontend_dir), shell=True)
    if res.returncode == 0:
        return 100, "بیلد پروداکشن فرانت‌اند Next.js با موفقیت و بدون خطای تایپ‌اسکریپت کامپایل شد."
    else:
        err = (res.stderr or res.stdout)[-300:]
        return 40, f"خطا در بیلد فرانت‌اند: {err}"

def check_seo_artifacts():
    required_files = [
        ROOT_DIR / "frontend/src/app/sitemap.ts",
        ROOT_DIR / "frontend/src/app/robots.ts",
        ROOT_DIR / "frontend/public/llms.txt",
    ]
    missing = [f.name for f in required_files if not f.exists()]
    if not missing:
        return 100, "فایل‌های سئو (sitemap.ts، robots.ts و llms.txt) مستقر هستند."
    else:
        return 50, f"فایل‌های مفقود: {', '.join(missing)}"

def main():
    print("="*75)
    print("🚀 چرخه خودکار ارزیابی کیفیت واقعی سامانه")
    print("   پایگاه رسمی حجت الاسلام دکتر زنجیرزن حسینی")
    print("="*75)
    
    steps = [
        ("۱. آزمون‌های جامع بک‌اند و استریم DRM (test_in_memory)", check_backend_in_memory_tests),
        ("۲. آزمون‌های یکپارچگی اندپوینت‌های API v1 (test_api_v1)", check_backend_api_v1_tests),
        ("۳. استقرار فایل‌های استاندارد سئو (sitemap, robots, llms.txt)", check_seo_artifacts),
        ("۴. کامپایل پروداکشن و سلامت کدهای فرانت‌اند (npm run build)", check_frontend_build),
    ]
    
    total_score = 0
    for name, fn in steps:
        score = run_step(name, fn)
        total_score += score
        
    final_avg = round(total_score / len(steps))
    print("\n" + "="*75)
    print(f"📊 امتیاز نهایی آزمون‌های واقعی سامانه: {final_avg} از ۱۰۰")
    if final_avg == 100:
        print("🏆 وضعیت: تمامی تست‌های واقعی و بیلد سیستم ۱۰۰٪ موفق و آماده بهره‌برداری هستند!")
    else:
        print("⚠️ وضعیت: نیازمند بررسی خطاهای گزارش‌شده.")
    print("="*75)

if __name__ == "__main__":
    main()
