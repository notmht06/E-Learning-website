const ts = require('typescript');
const fs = require('fs'), path = require('path');
const root = require('path').resolve(__dirname, '../../src');
function walk(d, out=[]) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p, out) : /\.tsx?$/.test(f) && out.push(p); } return out; }
const isStr = n => n && (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n));
const langOf = c => { // c: X === 'en'
  if (ts.isBinaryExpression(c) && (c.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken) && isStr(c.right) && ['en','ar','fa'].includes(c.right.text)) return { subject: c.left.getText(), lang: c.right.text };
  return null; };
let triples = 0, partial = 0; const perFile = {}; const samples = [];
for (const file of walk(root)) {
  if (file.includes('/locales/')) continue;
  const sf = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const seen = new Set();
  (function visit(n) {
    if (ts.isConditionalExpression(n) && !seen.has(n)) {
      const a = langOf(n.condition);
      if (a) {
        const langs = {}; let cur = n, ok = true; langs[a.lang] = n.whenTrue; seen.add(n);
        if (ts.isConditionalExpression(n.whenFalse) && langOf(n.whenFalse.condition)) {
          const b = langOf(n.whenFalse.condition); seen.add(n.whenFalse); langs[b.lang] = n.whenFalse.whenTrue; langs.rest = n.whenFalse.whenFalse; if (b.subject !== a.subject) ok = false;
        } else { langs.rest = n.whenFalse; }
        const allStr = Object.values(langs).every(isStr);
        const count = Object.keys(langs).length;
        if (ok && count === 3 && allStr) { triples++; perFile[path.relative(root, file)] = (perFile[path.relative(root, file)]||0)+1; if (samples.length<6) samples.push(path.relative(root,file)+': '+n.getText().replace(/\s+/g,' ').slice(0,110)); }
        else partial++;
      }
    }
    ts.forEachChild(n, visit);
  })(sf);
}
console.log('clean 3-language string triples:', triples, '| other lang-conditionals (mixed/2-way/non-literal):', partial);
console.log('files with triples:', Object.keys(perFile).length);
console.log(Object.entries(perFile).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([f,n])=>n+' '+f).join('\n'));
console.log(samples.join('\n'));
