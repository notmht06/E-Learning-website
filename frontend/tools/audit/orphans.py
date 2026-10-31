import re, pathlib, sys
root = pathlib.Path(sys.argv[1]) / "src"
files = {p: p.read_text(encoding="utf-8", errors="replace") for p in root.rglob("*.ts*")}
by_stem = {}
for p in files:
    rel = p.relative_to(root).with_suffix("")
    by_stem[str(rel)] = p
imports = {p: set() for p in files}
rx = re.compile(r"""(?:from|import)\s*\(?\s*['"]([^'"]+)['"]""")
for p, t in files.items():
    for m in rx.finditer(t):
        spec = m.group(1)
        if spec.startswith("@/"): target = spec[2:]
        elif spec.startswith("."): target = str((p.parent / spec).resolve().relative_to(root.resolve())) if str((p.parent/spec).resolve()).startswith(str(root.resolve())) else None
        else: continue
        if not target: continue
        for cand in (target, target + "/index"):
            if cand in by_stem: imports[p].add(by_stem[cand])
imported = set().union(*imports.values())
entry = lambda p: p.name in ("page.tsx","layout.tsx","error.tsx","loading.tsx","not-found.tsx","global-error.tsx","template.tsx","manifest.ts","sitemap.ts","robots.ts","opengraph-image.tsx","route.ts") 
orph = [p for p in files if p not in imported and not entry(p) and "locales" not in str(p) and not str(p).endswith(".d.ts")]
print(len(orph), "orphan modules (never imported):")
for p in sorted(orph): print("  ", p.relative_to(root), f"({len(files[p].splitlines())} lines)")
