import re, sys, json, collections, pathlib
root = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else ".") / "src"
EMOJI = re.compile("[\U0001F300-\U0001FAFF\u2600-\u27BF\u2B50\u2B06\u2705\u274C\u26A0\u2728]|\uFE0F")
AR = re.compile(r"[\u0600-\u06FF]")
rules = {
 "emoji":            (EMOJI, "tsx"),
 "gradient":         (re.compile(r"\b(bg-gradient-to-\w+|bg-linear-to-\w+|from-\[?#?\w|via-\[?#?\w|linear-gradient|radial-gradient|conic-gradient)"), "any"),
 "gradient_text":    (re.compile(r"bg-clip-text|text-transparent"), "any"),
 "glow_shadow":      (re.compile(r"shadow-\[[^\]]*(rgba|#)[^\]]*\]|drop-shadow|shadow-(blue|purple|indigo|violet|cyan|emerald|amber|rose|red|green)-"), "any"),
 "blur_blob":        (re.compile(r"\bblur-(2xl|3xl|\[)"), "any"),
 "uppercase":        (re.compile(r"\buppercase\b"), "any"),
 "tracking_wide":    (re.compile(r"tracking-(widest|wider|wide)\b|tracking-\[0?\.[1-9]"), "any"),
 "neg_tracking_small": (re.compile(r"tracking-(tight|tighter)\b"), "any"),
 "font_black_extra": (re.compile(r"font-(black|extrabold)\b"), "any"),
 "italic":           (re.compile(r"\bitalic\b"), "any"),
 "animate_pulse":    (re.compile(r"animate-pulse"), "any"),
 "animate_ping":     (re.compile(r"animate-ping"), "any"),
 "animate_bounce":   (re.compile(r"animate-bounce"), "any"),
 "transition_all":   (re.compile(r"\btransition-all\b"), "any"),
 "hover_scale":      (re.compile(r"hover:scale-|group-hover:scale-"), "any"),
 "ease_in":          (re.compile(r"\bease-in\b|ease-in-out"), "any"),
 "phys_margin_pad":  (re.compile(r"(?<![\w-])-?(ml|mr|pl|pr)-(\[|\d|px|auto)"), "any"),
 "phys_inset":       (re.compile(r"(?<![\w:-])(left|right)-(\[|\d|px|full|auto|1/2)|(?<=[: ])(left|right)-(\[|\d|px|full|auto|1/2)"), "any"),
 "phys_text":        (re.compile(r"\btext-(left|right)\b"), "any"),
 "phys_border_round":(re.compile(r"\b(border-[lr](-\w+)?|rounded-[lr](-\w+)?|rounded-(tl|tr|bl|br)(-\w+)?)\b"), "any"),
 "banned_color":     (re.compile(r"\b(bg|text|border|ring|from|to|via|shadow)-(blue|red|green|purple|indigo|violet|cyan|lime|fuchsia|pink|sky|teal|emerald|rose|orange|yellow)-\d{2,3}"), "any"),
 "tiny_text":        (re.compile(r"text-\[(8|9|10)px\]"), "any"),
 "arbitrary_px":     (re.compile(r"\b(m|p|mt|mb|ms|me|mx|my|pt|pb|ps|pe|px|py|gap|space-[xy]|h|w|top|bottom|start|end)-\[(\d+)px\]"), "any"),
 "empty_catch":      (re.compile(r"\.catch\(\s*\(\s*\w*\s*\)\s*=>\s*\{\s*\}\s*\)|catch\s*(\(\w*\))?\s*\{\s*\}"), "any"),
 "console_log":      (re.compile(r"console\.(log|debug)\("), "any"),
 "any_type":         (re.compile(r":\s*any\b|as any\b|<any>"), "any"),
 "ts_ignore":        (re.compile(r"@ts-ignore|@ts-nocheck|eslint-disable"), "any"),
 "localhost":        (re.compile(r"localhost|127\.0\.0\.1"), "any"),
 "dangerous_html":   (re.compile(r"dangerouslySetInnerHTML"), "any"),
 "div_onclick":      (re.compile(r"<(div|span|li|p)\b[^>]*onClick="), "any"),
 "img_no_alt":       (re.compile(r"<img\b(?![^>]*\balt=)"), "any"),
 "exclaim_copy":     (re.compile(r"!\s*['\"`<]"), "locale"),
}
agg = collections.defaultdict(lambda: collections.Counter())
total = collections.Counter()
for p in sorted(root.rglob("*")):
    if p.suffix not in (".ts", ".tsx", ".css"): continue
    rel = str(p.relative_to(root))
    is_locale = rel.startswith("locales/")
    is_data = rel.startswith("lib/data") or rel.startswith("lib/roadmapData") or rel.startswith("lib/conceptGraphData")
    text = p.read_text(encoding="utf-8", errors="replace")
    for name, (rx, scope) in rules.items():
        if scope == "locale" and not is_locale: continue
        if scope == "tsx" and p.suffix == ".css": continue
        if is_locale and name not in ("emoji", "exclaim_copy"): continue
        n = len(rx.findall(text))
        if n:
            agg[name][rel] += n; total[name] += n
    # hardcoded persian/arabic outside locales
    if not is_locale and p.suffix in (".ts", ".tsx"):
        hits = 0
        for line in text.splitlines():
            s = line.strip()
            if s.startswith("//") or s.startswith("*") or s.startswith("/*"): continue
            if AR.search(line): hits += 1
        if hits:
            key = "persian_hardcoded_data" if is_data else "persian_hardcoded_ui"
            agg[key][rel] += hits; total[key] += hits
    # file size
    lines = text.count("\n") + 1
    if p.suffix == ".tsx" and lines > 500 and not is_locale:
        agg["over_500_lines"][rel] = lines; total["over_500_lines"] += 1
out = {"total": dict(total), "top": {k: agg[k].most_common(8) for k in agg}, "files_per_rule": {k: len(agg[k]) for k in agg}}
import tempfile, os
json.dump(out, open(os.path.join(tempfile.gettempdir(), "frontend_audit_scan.json"), "w"), ensure_ascii=False, indent=1)
print(f"{'rule':24}{'hits':>7}{'files':>7}")
for k, v in sorted(total.items(), key=lambda x: -x[1]):
    print(f"{k:24}{v:>7}{len(agg[k]):>7}")
