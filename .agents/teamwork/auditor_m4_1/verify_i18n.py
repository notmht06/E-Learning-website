import re
from pathlib import Path

loc_dir = Path("frontend/src/locales")
results = {}

for lang in ["fa", "ar", "en"]:
    fpath = loc_dir / f"{lang}.ts"
    text = fpath.read_text(encoding="utf-8")
    # match top-level dictionary keys: 'key': ... or key: ...
    # Each key is indented with 2 or 4 spaces and ends with colon
    keys = re.findall(r'^\s{2,4}([\'\"][^\'\"]+[\'\"]|[a-zA-Z0-9_\$]+)\s*:', text, re.MULTILINE)
    clean_keys = [k.strip('\'"') for k in keys]
    results[lang] = clean_keys
    print(f"{lang} total keys: {len(clean_keys)}, unique: {len(set(clean_keys))}")

fa_set = set(results["fa"])
ar_set = set(results["ar"])
en_set = set(results["en"])

missing_in_ar = fa_set - ar_set
missing_in_en = fa_set - en_set
extra_in_ar = ar_set - fa_set
extra_in_en = en_set - fa_set

print(f"fa key count: {len(fa_set)}")
print(f"Missing in ar: {len(missing_in_ar)} keys")
if missing_in_ar:
    print(f"  Examples: {list(missing_in_ar)[:5]}")
print(f"Missing in en: {len(missing_in_en)} keys")
if missing_in_en:
    print(f"  Examples: {list(missing_in_en)[:5]}")
print(f"Extra in ar: {len(extra_in_ar)} keys")
print(f"Extra in en: {len(extra_in_en)} keys")
