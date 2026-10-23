with open('frontend/src/lib/data.ts', 'r', encoding='utf-8') as f:
    lines = f.readlines()

test_lines = [2589, 2590, 2592, 2593, 2594, 2596, 2599, 2600, 2602, 2603, 2604, 2605, 2606, 2698, 2713, 2714]
for idx in test_lines:
    line = lines[idx-1]
    key = line.split(':')[0].strip()
    print(f"Line {idx}: {key}")
    # find other lines with same key
    matches = [i+1 for i, l in enumerate(lines) if l.strip().startswith(key + ':') or l.strip().startswith("'" + key + "':") or l.strip().startswith('"' + key + '":')]
    print(f"   Duplicate occurrences at lines: {matches}")
