import re, sys, pathlib, collections, json
root = pathlib.Path(sys.argv[1]) / "src"
def keys_of(f):
    t = (root/"locales"/f).read_text(encoding="utf-8")
    return dict(re.findall(r"^\s{2}(\w+):\s*(?:'((?:[^'\\]|\\.)*)'|\"((?:[^\"\\]|\\.)*)\"|`([^`]*)`)", t, re.M) and
                [(m.group(1), next(g for g in m.groups()[1:] if g is not None)) for m in re.finditer(r"^\s{2}(\w+):\s*(?:'((?:[^'\\]|\\.)*)'|\"((?:[^\"\\]|\\.)*)\"|`([^`]*)`)", t, re.M)])
fa, ar, en = keys_of("fa.ts"), keys_of("ar.ts"), keys_of("en.ts")
print("locale key counts fa/ar/en:", len(fa), len(ar), len(en), "| fa-ar diff:", len(set(fa)^set(ar)), "| fa-en diff:", len(set(fa)^set(en)))
used = collections.defaultdict(set); fallback_pairs = []
use_rx = re.compile(r"\bdict\??\.(\w+)")
fb_rx = re.compile(r"\bdict\??\.(\w+)\s*(?:\|\||\?\?)\s*(['\"`])((?:(?!\2).)*?)\2")
for p in root.rglob("*.ts*"):
    rel = str(p.relative_to(root))
    if rel.startswith("locales/"): continue
    t = p.read_text(encoding="utf-8", errors="replace")
    for m in use_rx.finditer(t): used[m.group(1)].add(rel)
    for m in fb_rx.finditer(t): fallback_pairs.append((rel, m.group(1), m.group(3)))
missing = {k: sorted(v) for k, v in used.items() if k not in fa}
print("distinct dict.<key> used:", len(used), "| NOT defined in fa.ts:", len(missing))
print("fallback expressions (dict.k || 'text'):", len(fallback_pairs))
safe = [x for x in fallback_pairs if x[1] in fa]
unsafe = [x for x in fallback_pairs if x[1] not in fa]
same = [x for x in safe if fa[x[1]].strip() == x[2].strip()]
print(" - key exists in fa.ts (fallback removable):", len(safe), "| fallback text identical to fa value:", len(same), "| different text:", len(safe)-len(same))
print(" - key MISSING from locales (needs new keys):", len(unsafe), "unique keys:", len({x[1] for x in unsafe}))
print("\nMISSING keys (first 40):")
for k, files in list(missing.items())[:40]: print("  ", k, "->", files[:2])
pass
