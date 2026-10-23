# -*- coding: utf-8 -*-
"""
Automated i18n Dictionary Parity & Enterprise Compliance Test
پایگاه رسمی و جامع علمی و پژوهشی حجت الاسلام دکتر زنجیر زن حسینی
"""

import re
import sys
from pathlib import Path

# Ensure UTF-8 output
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

ROOT_DIR = Path(__file__).resolve().parent.parent.parent

def test_i18n_parity_and_compliance():
    locales_dir = ROOT_DIR / "frontend/src/locales"
    assert locales_dir.exists(), "locales directory missing!"
    
    fa_text = (locales_dir / "fa.ts").read_text(encoding="utf-8")
    ar_text = (locales_dir / "ar.ts").read_text(encoding="utf-8")
    en_text = (locales_dir / "en.ts").read_text(encoding="utf-8")

    def parse_keys(text):
        keys = []
        for line in text.splitlines():
            line = line.strip()
            if not line or line.startswith("//") or line.startswith("export") or line.startswith("import") or line in ["} as const;", "};"]:
                continue
            m = re.match(r"^([a-zA-Z0-9_]+)\s*:", line)
            if m:
                keys.append(m.group(1))
        return keys

    fa_keys = parse_keys(fa_text)
    ar_keys = parse_keys(ar_text)
    en_keys = parse_keys(en_text)

    print(f"Total keys - FA: {len(fa_keys)}, AR: {len(ar_keys)}, EN: {len(en_keys)}")
    assert len(fa_keys) == len(ar_keys) == len(en_keys), f"Key counts mismatch: FA={len(fa_keys)}, AR={len(ar_keys)}, EN={len(en_keys)}"
    assert set(fa_keys) == set(ar_keys) == set(en_keys), f"Key set mismatch! Diff AR: {set(fa_keys) ^ set(ar_keys)}, Diff EN: {set(fa_keys) ^ set(en_keys)}"
    assert fa_keys == ar_keys == en_keys, "Key order mismatch across languages!"

    # Scholar identity checks
    assert "حجت الاسلام دکتر زنجیر زن حسینی" in fa_text, "Official Scholar name missing in fa.ts"
    assert "حجة الإسلام الدكتور زنجير زن حسيني" in ar_text, "Official Scholar name in Arabic missing in ar.ts"
    assert "Hujjat al-Islam Dr. Zanjirzan Hosseini" in en_text, "Official Scholar name in English missing in en.ts"

    # Anti-slop in Persian writing checks
    forbidden = ["می‌باشد", "می باشد", "می‌باشند", "می باشند", "لازم به ذکر است", "شایان ذکر است"]
    for phrase in forbidden:
        assert phrase not in fa_text, f"Forbidden Persian phrase found: {phrase}"

    # Verify data.ts backwards compatibility re-export
    data_text = (ROOT_DIR / "frontend/src/lib/data.ts").read_text(encoding="utf-8")
    assert "export { i18nDict, type SupportedLang } from '@/locales';" in data_text, "Re-export in data.ts missing!"

    print("✅ All i18n parity, typing, and compliance checks PASSED!")
    return True

if __name__ == "__main__":
    test_i18n_parity_and_compliance()
