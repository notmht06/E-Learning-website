import re
import sys
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

loc_dir = Path("frontend/src/locales")

def parse_dict(filepath):
    text = filepath.read_text(encoding="utf-8")
    # match 'key': 'val' or key: 'val' or `val`
    entries = re.findall(r'^\s{2,4}([\'\"][^\'\"]+[\'\"]|[a-zA-Z0-9_\$]+)\s*:\s*(?:[\'\"`](.*?)[\'\"`]|([^\n,]+))', text, re.MULTILINE)
    data = {}
    for k, v1, v2 in entries:
        val = v1 if v1 is not None else v2
        data[k.strip('\'"')] = val
    return data

fa_dict = parse_dict(loc_dir / "fa.ts")
ar_dict = parse_dict(loc_dir / "ar.ts")
en_dict = parse_dict(loc_dir / "en.ts")

empty_fa = [k for k, v in fa_dict.items() if not v or v.strip() == ""]
empty_ar = [k for k, v in ar_dict.items() if not v or v.strip() == ""]
empty_en = [k for k, v in en_dict.items() if not v or v.strip() == ""]

print(f"Empty in fa: {len(empty_fa)}")
print(f"Empty in ar: {len(empty_ar)}")
print(f"Empty in en: {len(empty_en)}")

# Sample 10 random keys across all three
keys_sample = list(fa_dict.keys())[::67]
print("\n--- Sample Keys & Values ---")
for k in keys_sample:
    print(f"Key: {k}")
    print(f"  FA: {fa_dict.get(k)}")
    print(f"  AR: {ar_dict.get(k)}")
    print(f"  EN: {en_dict.get(k)}")
