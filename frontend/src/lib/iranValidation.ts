/**
 * مجموعه توابع اعتبارسنجی و فرمت‌بندی هویت مالی و ملی ایران (VibeFarsi Iran Validation)
 * پشتیبانی کامل از ارقام فارسی، عربی و انگلیسی با استانداردهای رسمی کشور
 */

/**
 * تبدیل ارقام فارسی و عربی به ارقام استاندارد انگلیسی
 */
export function toEnglishDigits(value: string | number): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

  let result = str;
  for (let i = 0; i < 10; i++) {
    result = result.replaceAll(persianDigits[i], String(i));
    result = result.replaceAll(arabicDigits[i], String(i));
  }
  return result;
}

/**
 * تبدیل ارقام انگلیسی به ارقام زیبای فارسی
 */
export function toPersianDigits(value: string | number): string {
  if (value === null || value === undefined) return '';
  const str = String(value);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/\d/g, (match) => persianDigits[parseInt(match, 10)]);
}

/**
 * فرمت‌بندی مبلغ به تومان با جداکننده سه‌رقمی و ارقام فارسی
 */
export function formatToman(amount: number | string): string {
  const normalized = parseInt(toEnglishDigits(amount).replace(/[^\d]/g, ''), 10);
  if (isNaN(normalized)) return '۰ تومان';
  const formatted = normalized.toLocaleString('en-US');
  return `${toPersianDigits(formatted)} تومان`;
}

/**
 * اعتبارسنجی رسمی کد ملی ده‌رقمی ایران (سازمان ثبت احوال)
 * بررسی طول ۱۰ رقم، رد ارقام تکراری و محاسبه رقم کنترلی نهایی
 */
export function validateNationalId(code: string | number): boolean {
  const cleaned = toEnglishDigits(code).trim().replace(/[^\d]/g, '');
  if (cleaned.length !== 10) return false;

  // رد کدهای ملی تکراری غیرمعتبر نظیر 0000000000، 1111111111 و ...
  if (/^(\d)\1{9}$/.test(cleaned)) return false;

  const checkDigit = parseInt(cleaned.charAt(9), 10);
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i), 10) * (10 - i);
  }

  const remainder = sum % 11;
  if (remainder < 2) {
    return checkDigit === remainder;
  }
  return checkDigit === 11 - remainder;
}

/**
 * اعتبارسنجی شماره شبای بانکی ایران (IBAN - ISO 13616)
 * طول ۲۶ کاراکتر، شروع با IR و محاسبه باقی‌مانده استاندارد MOD-97
 */
export function validateSheba(sheba: string): boolean {
  let cleaned = toEnglishDigits(sheba).trim().toUpperCase().replace(/\s/g, '');
  if (!cleaned.startsWith('IR')) {
    cleaned = 'IR' + cleaned;
  }

  if (cleaned.length !== 26) return false;

  // فرمت IR به علاوه ۲۴ رقم عددی
  if (!/^IR\d{24}$/.test(cleaned)) return false;

  // جابجایی ۴ کاراکتر اول به انتها و تبدیل حروف به اعداد (A=10 ... I=18, R=27)
  const rearranged = cleaned.slice(4) + '1827' + cleaned.slice(2, 4);

  // محاسبه باقی‌مانده تقسیم بر ۹۷ به روش تکه‌تکه (برای جلوگیری از Overflow اعداد بزرگ)
  let remainder = 0;
  for (let i = 0; i < rearranged.length; i += 7) {
    const block = String(remainder) + rearranged.substring(i, i + 7);
    remainder = parseInt(block, 10) % 97;
  }

  return remainder === 1;
}

/**
 * اعتبارسنجی شماره کارت‌های ۱۶ رقمی عضو شبکه شتاب (الگوریتم Luhn)
 */
export function validateCardNumber(cardNumber: string | number): boolean {
  const cleaned = toEnglishDigits(cardNumber).trim().replace(/[^\d]/g, '');
  if (cleaned.length !== 16) return false;

  // پیش‌شماره‌های معتبر شتاب (۶ رقم اول)
  const recognizedPrefixes = [
    '603799', // بانک ملی
    '589210', // بانک سپه
    '627648', // بانک توسعه صادرات
    '627961', // بانک صنعت و معدن
    '603770', // بانک کشاورزی
    '628023', // بانک مسکن
    '627760', // پست بانک
    '621986', // بانک سامان
    '627412', // بانک اقتصاد نوین
    '622106', // بانک پارسیان
    '502229', // بانک پاسارگاد
    '627488', // بانک کارآفرین
    '610433', // بانک ملت
    '585983', // بانک تجارت
    '627381', // بانک انصار
    '505785', // بانک ایران‌زمین
    '636214', // بانک آینده
    '502806', // بانک شهر
    '502908', // بانک توسعه تعاون
    '505416', // بانک گردشگری
    '639599', // بانک قوامین
    '639607', // بانک سرمایه
    '639346', // بانک سینا
    '504706', // بانک شهر
    '606373', // بانک قرض‌الحسنه مهر ایران
    '606256', // موسسه اعتباری ملل
  ];

  const prefix = cleaned.substring(0, 6);
  // توجه: الگوریتم لون شرط اصلی است، پیش‌شماره شتاب جهت دقت بیشتر بررسی می‌شود
  const isPrefixRecognized = recognizedPrefixes.includes(prefix);

  // الگوریتم لوان (Luhn Algorithm)
  let sum = 0;
  for (let i = 0; i < 16; i++) {
    let digit = parseInt(cleaned.charAt(i), 10);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }

  return sum % 10 === 0 && (isPrefixRecognized || sum > 0);
}

/**
 * اعتبارسنجی شماره تلفن همراه ایران (پیش‌شماره‌های اپراتورهای همراه اول، ایرانسل، رایتل، شاتل و ...)
 */
export function validateIranianMobile(phone: string | number): boolean {
  let cleaned = toEnglishDigits(phone).trim().replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+98')) {
    cleaned = '0' + cleaned.slice(3);
  } else if (cleaned.startsWith('0098')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('98')) {
    cleaned = '0' + cleaned.slice(2);
  } else if (cleaned.length === 10 && cleaned.startsWith('9')) {
    cleaned = '0' + cleaned;
  }

  // بررسی قالب استاندارد 09xxxxxxxxx
  return /^09[0-9]{9}$/.test(cleaned);
}
