# Breaking UI Skill Reference
Dumped from: e:\personal\philosophy_zanjirzan_app\.agents\skills\break-ui\SKILL.md

Core Methodology:
1. Map surface: list every rendered value, limit, optionality.
2. Build worst case: realistic limits, zero items, huge counts, unbounded strings, missing optional fields.
3. Check failure signatures: overflow, squished elements, raw unescaped values, broken links, routing errors, type failures.
4. Report before fixing: broken, ugly, fragile.
