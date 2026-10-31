import re, sys, pathlib, collections
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
root = pathlib.Path(sys.argv[1]) / "src"
AR = re.compile(r"[\u0600-\u06FF]")
cat = collections.Counter(); per_file = collections.defaultdict(collections.Counter); samples = collections.defaultdict(list)
for p in sorted(root.rglob("*.ts*")):
    rel = str(p.relative_to(root))
    if rel.startswith("locales/") or rel.startswith("lib/data") or rel.startswith("lib/roadmapData") or rel.startswith("lib/conceptGraphData"): continue
    for i, line in enumerate(p.read_text(encoding="utf-8", errors="replace").splitlines(), 1):
        s = line.strip()
        if not AR.search(line) or s.startswith(("//", "*", "/*")): continue
        if re.search(r"(dict|t)\??\.\w+\s*(\|\||\?\?)\s*['\"`]", line) or re.search(r"\|\|\s*['\"`][^'\"`]*[\u0600-\u06FF]", line):
            c = "fallback_after_dict"
        elif re.search(r"\b(placeholder|aria-label|title|alt|label)=[\"'{]", line):
            c = "attribute_text"
        elif re.search(r"toast\.|alert\(|confirm\(|new Error\(|throw ", line):
            c = "toast_or_error"
        elif re.match(r"^[^<>{}=]*[\u0600-\u06FF][^<>{}=]*$", s) and not s.endswith((",", ";")):
            c = "jsx_text_node"
        elif re.search(r"^\s*['\"`{\w]*\s*[:=]?\s*['\"`][^'\"`]*[\u0600-\u06FF]", line) or re.search(r":\s*['\"`][^'\"`]*[\u0600-\u06FF]", line):
            c = "object_or_array_literal"
        else:
            c = "other_jsx_or_expr"
        cat[c] += 1; per_file[rel][c] += 1
        if len(samples[c]) < 4: samples[c].append(f"{rel}:{i}: {s[:110]}")
print("CATEGORY BREAKDOWN"); 
for k, v in cat.most_common(): print(f"  {k:26}{v:>6}")
print("\nTOP FILES"); 
for f, c in sorted(per_file.items(), key=lambda x: -sum(x[1].values()))[:25]: print(f"  {sum(c.values()):>4}  {f}   {dict(c)}")
print("\nSAMPLES")
for k, v in samples.items():
    print(f"[{k}]"); [print("   ", x) for x in v]
