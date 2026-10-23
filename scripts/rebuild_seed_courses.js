const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '../frontend/src/lib/data.ts');
const targetFile = path.join(__dirname, '../backend/app/models/seed_courses_data.json');

const content = fs.readFileSync(dataFile, 'utf8');
const startMarker = 'export const coursesDatabase: Record<string, AudioCourse> = ';
const startIdx = content.indexOf(startMarker);

if (startIdx === -1) {
  console.error('Could not find startMarker');
  process.exit(1);
}

const sliceFromStart = content.slice(startIdx + startMarker.length);
// Find the closing brace of the object
let braceCount = 0;
let started = false;
let endIdx = -1;

for (let i = 0; i < sliceFromStart.length; i++) {
  const ch = sliceFromStart[i];
  if (ch === '{') {
    braceCount++;
    started = true;
  } else if (ch === '}') {
    braceCount--;
    if (started && braceCount === 0) {
      endIdx = i + 1;
      break;
    }
  }
}

if (endIdx === -1) {
  console.error('Could not find balanced closing brace');
  process.exit(1);
}

const objText = sliceFromStart.slice(0, endIdx);
const evaluated = new Function('return ' + objText)();

console.log('Courses count:', Object.keys(evaluated).length);
console.log('Sample course title:', evaluated['course-mantiq-mabadi'].title_fa);
console.log('Sample instructor:', evaluated['course-mantiq-mabadi'].instructor_fa);

fs.writeFileSync(targetFile, JSON.stringify(evaluated, null, 2), 'utf8');
console.log('Successfully written clean UTF-8 seed_courses_data.json to', targetFile);
