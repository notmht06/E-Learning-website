const ts = require('typescript');
const fs = require('fs'), path = require('path');
const root = require('path').resolve(__dirname, '../../src');
const DRY = process.argv.includes('--dry');
function walk(d, out=[]) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p, out) : /\.tsx?$/.test(f) && out.push(p); } return out; }
const isStr = n => n && (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n));
const cond = c => (ts.isBinaryExpression(c) && c.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken && isStr(c.right) && ['en','ar','fa'].includes(c.right.text)) ? { subject: c.left.getText(), lang: c.right.text } : null;
const existing = {}; // key -> {fa,ar,en}
const keyByTriple = new Map(); const usedKeys = new Set();
const localeSrc = fs.readFileSync(path.join(root,'locales/fa.ts'),'utf8');
for (const m of localeSrc.matchAll(/^\s{2}(\w+):/gm)) usedKeys.add(m[1]);
const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,38);
function keyFor(t) {
  const id = JSON.stringify([t.fa,t.ar,t.en]);
  if (keyByTriple.has(id)) return keyByTriple.get(id);
  let base = 'ui_' + (slug(t.en) || 'text'), k = base, i = 2;
  while (usedKeys.has(k)) k = base + '_' + i++;
  usedKeys.add(k); keyByTriple.set(id, k); existing[k] = t; return k;
}
function findLangBinding(node) { // nearest enclosing `const {... currentLang ...} = useLanguage()`
  for (let n = node.parent; n; n = n.parent) {
    if (ts.isBlock(n) || ts.isSourceFile(n)) {
      for (const st of n.statements) {
        if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) {
          if (ts.isObjectBindingPattern(d.name) && d.initializer && ts.isCallExpression(d.initializer) && d.initializer.expression.getText() === 'useLanguage') {
            const names = d.name.elements.map(e => e.name.getText());
            if (names.includes('currentLang')) return { pattern: d.name, hasDict: names.includes('dict') };
          }
        }
      }
    }
  }
  return null;
}
let converted = 0, skippedNoDict = 0, skippedSubject = 0; const filesTouched = {}; const skipped = [];
for (const file of walk(root)) {
  if (file.includes('/locales/')) continue;
  const text = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const edits = []; const patternDone = new Set(); const seen = new Set();
  (function visit(n) {
    if (ts.isConditionalExpression(n) && !seen.has(n)) {
      const a = cond(n.condition);
      if (a && ts.isConditionalExpression(n.whenFalse) && cond(n.whenFalse.condition)) {
        const b = cond(n.whenFalse.condition); seen.add(n.whenFalse);
        const m = { [a.lang]: n.whenTrue, [b.lang]: n.whenFalse.whenTrue };
        const missing = ['fa','ar','en'].filter(l => !(l in m));
        if (a.subject === b.subject && a.lang !== b.lang && missing.length === 1 && [m.fa, m.ar, m.en, n.whenFalse.whenFalse].filter(Boolean).every(isStr)) {
          m[missing[0]] = n.whenFalse.whenFalse;
          if (a.subject !== 'currentLang') { skippedSubject++; skipped.push(path.relative(root,file)+' [subject '+a.subject+']'); }
          else {
            const bind = findLangBinding(n);
            if (!bind) { skippedNoDict++; skipped.push(path.relative(root,file)+' [no useLanguage binding in scope] '+m.en.text.slice(0,30)); }
            else {
              const key = keyFor({ fa: m.fa.text, ar: m.ar.text, en: m.en.text });
              edits.push({ start: n.getStart(sf), end: n.getEnd(), text: 'dict.' + key });
              if (!bind.hasDict && !patternDone.has(bind.pattern)) { patternDone.add(bind.pattern); edits.push({ start: bind.pattern.elements[0].getStart(sf), end: bind.pattern.elements[0].getStart(sf), text: 'dict, ' }); }
              converted++; filesTouched[path.relative(root,file)] = (filesTouched[path.relative(root,file)]||0)+1;
            }
          }
        }
      }
    }
    ts.forEachChild(n, visit);
  })(sf);
  if (edits.length && !DRY) {
    edits.sort((x,y) => y.start - x.start || y.end - x.end);
    let out = text; for (const e of edits) out = out.slice(0, e.start) + e.text + out.slice(e.end);
    fs.writeFileSync(file, out);
  }
}
// locales
if (!DRY) {
  for (const lang of ['fa','ar','en']) {
    const p = path.join(root, `locales/${lang}.ts`); const raw = fs.readFileSync(p,'utf8'); const crlf = raw.includes('\r\n');
    let s = raw.replace(/\r\n/g,'\n'); const marker = lang === 'fa' ? '\n} as const;\n' : '\n};\n';
    const q = v => "'" + v.replace(/\\/g,'\\\\').replace(/'/g,"\\'").replace(/\n/g,'\\n') + "'";
    const block = Object.entries(existing).map(([k,t]) => `  ${k}: ${q(t[lang])},\n`).join('');
    if (!s.includes(marker)) throw new Error('marker missing '+lang);
    s = s.replace(marker, '\n' + block + marker.slice(1));
    fs.writeFileSync(p, crlf ? s.replace(/\n/g,'\r\n') : s);
  }
}
console.log(JSON.stringify({ converted, newKeys: Object.keys(existing).length, skippedNoDict, skippedSubject, files: Object.keys(filesTouched).length }));
console.log(skipped.slice(0,25).join('\n'));
