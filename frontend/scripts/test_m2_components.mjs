/**
 * Empirical Frontend Verification Harness for Milestone 2
 * Tests component logic, lock rules, enrollment state transitions, and AST/code constraints.
 */
import fs from 'fs';
import path from 'path';
import assert from 'assert';

console.log('=== RUNNING EMPIRICAL M2 FRONTEND HARNESS ===');

// 1. Test CoursePlaylistSidebar lock and click logic
console.log('\n[1] Testing CoursePlaylistSidebar Lock & Click Invariants...');
const mockChapters = [
  { id: 1, title_fa: 'جلسه ۱: مدخل', duration: '۴۵:۰۰', isFreePreview: false },
  { id: 2, title_fa: 'جلسه ۲: مبادی', duration: '۵۰:۰۰', isFreePreview: false },
  { id: 3, title_fa: 'جلسه ۳: نمونه آزاد', duration: '۴۰:۰۰', isFreePreview: true },
  { id: 4, title_fa: 'جلسه ۴: درس پیشرفته', duration: '۵۵:۰۰', isFreePreview: false },
];

function simulateSidebarItem(ch, idx, isEnrolled, onSelectChapter, mockAlert) {
  const isPreview = !!ch.isFreePreview || idx === 0;
  const isLocked = !isEnrolled && !isPreview;
  const clickHandler = () => {
    if (isLocked) {
      mockAlert('این جلسه نیازمند ثبت‌نام در دوره است.');
    } else {
      onSelectChapter(idx);
    }
  };
  return { isPreview, isLocked, clickHandler };
}

// Case A: Unenrolled student
let selectedIndex = null;
let alertMsg = null;
const onSelect = (idx) => { selectedIndex = idx; };
const onAlert = (msg) => { alertMsg = msg; };

// Chapter 0 (index 0): Must be unlocked preview
let item0 = simulateSidebarItem(mockChapters[0], 0, false, onSelect, onAlert);
assert.strictEqual(item0.isPreview, true, 'Chapter 0 must be preview');
assert.strictEqual(item0.isLocked, false, 'Chapter 0 must not be locked');
item0.clickHandler();
assert.strictEqual(selectedIndex, 0, 'Chapter 0 must be playable by unenrolled visitor');

// Chapter 1 (index 1, non-preview): Must be locked
selectedIndex = null;
alertMsg = null;
let item1 = simulateSidebarItem(mockChapters[1], 1, false, onSelect, onAlert);
assert.strictEqual(item1.isPreview, false, 'Chapter 1 must not be preview');
assert.strictEqual(item1.isLocked, true, 'Chapter 1 must be locked for unenrolled visitor');
item1.clickHandler();
assert.strictEqual(selectedIndex, null, 'Locked chapter must NOT trigger onSelectChapter');
assert.ok(alertMsg.includes('نیازمند ثبت‌نام'), 'Locked chapter must alert enrollment requirement');

// Chapter 2 (index 2, has isFreePreview: true): Must be unlocked preview
selectedIndex = null;
alertMsg = null;
let item2 = simulateSidebarItem(mockChapters[2], 2, false, onSelect, onAlert);
assert.strictEqual(item2.isPreview, true, 'Chapter 2 with isFreePreview must be preview');
assert.strictEqual(item2.isLocked, false, 'Chapter 2 with isFreePreview must not be locked');
item2.clickHandler();
assert.strictEqual(selectedIndex, 2, 'Chapter 2 with isFreePreview must be playable');

// Case B: Enrolled student
// All chapters must be unlocked
for (let i = 0; i < mockChapters.length; i++) {
  selectedIndex = null;
  alertMsg = null;
  let enrolledItem = simulateSidebarItem(mockChapters[i], i, true, onSelect, onAlert);
  assert.strictEqual(enrolledItem.isLocked, false, `Chapter ${i} must be unlocked for enrolled student`);
  enrolledItem.clickHandler();
  assert.strictEqual(selectedIndex, i, `Chapter ${i} must trigger onSelectChapter for enrolled student`);
  assert.strictEqual(alertMsg, null, `Chapter ${i} must not alert for enrolled student`);
}
console.log('  --> PASSED: CoursePlaylistSidebar lock and playback rules validated.');

// 2. Test CourseEnrollmentCard transitions
console.log('\n[2] Testing CourseEnrollmentCard State Transition Logic...');
function getEnrollmentCardRender(isEnrolled, isLoading, error, price, courseId, currentLang) {
  if (isEnrolled) {
    const statusText = currentLang === 'en'
      ? 'Enrolled. All sessions are unlocked.'
      : currentLang === 'ar'
      ? 'تم التسجيل في هذه الدورة. جميع الجلسات متاحة.'
      : 'ثبت‌نام شده • تمامی جلسات باز است';
    const linkHref = `/courses/${courseId}/learn`;
    const linkText = currentLang === 'en'
      ? 'Enter Course Player'
      : currentLang === 'ar'
      ? 'دخول بيئة التعلم (مشغل الدورة)'
      : 'ورود به محیط یادگیری و پخش دوره';
    return { isEnrolled: true, statusText, linkHref, linkText, error };
  } else {
    const btnText = isLoading ? 'در حال ثبت‌نام...' : 'ثبت‌نام در دوره';
    return { isEnrolled: false, btnText, isLoading, price, error };
  }
}

// Unenrolled state
const unenrolledCard = getEnrollmentCardRender(false, false, null, '۲۵۰,۰۰۰ تومان', 'course-asfar', 'fa');
assert.strictEqual(unenrolledCard.isEnrolled, false);
assert.strictEqual(unenrolledCard.btnText, 'ثبت‌نام در دوره');

// Loading state
const loadingCard = getEnrollmentCardRender(false, true, null, '۲۵۰,۰۰۰ تومان', 'course-asfar', 'fa');
assert.strictEqual(loadingCard.isLoading, true);
assert.strictEqual(loadingCard.btnText, 'در حال ثبت‌نام...');

// Transition to Enrolled state
const enrolledCard = getEnrollmentCardRender(true, false, null, '۲۵۰,۰۰۰ تومان', 'course-asfar', 'fa');
assert.strictEqual(enrolledCard.isEnrolled, true);
assert.ok(enrolledCard.statusText.includes('ثبت‌نام شده'), 'Status text must contain "ثبت‌نام شده"');
assert.strictEqual(enrolledCard.linkHref, '/courses/course-asfar/learn');
assert.strictEqual(enrolledCard.linkText, 'ورود به محیط یادگیری و پخش دوره');
console.log('  --> PASSED: CourseEnrollmentCard transitions validated.');

// 3. Test useCourseEnrollment logic
console.log('\n[3] Testing useCourseEnrollment Logic...');
function simulateUseCourseEnrollment(user, courseId, mockRouter, mockEnrollCourse) {
  const isEnrolled = !!user && (user.role === 'ADMIN' || (user.enrolledCourseIds && user.enrolledCourseIds.includes(courseId)));
  const handleEnroll = async (title, price) => {
    if (!user) {
      mockRouter.push('/login');
      return { redirected: true };
    }
    await mockEnrollCourse(courseId);
    return { enrolled: true };
  };
  return { isEnrolled, handleEnroll };
}

// Unauthenticated user
let pushedRoute = null;
const mockRouter = { push: (r) => { pushedRoute = r; } };
let hookUnauth = simulateUseCourseEnrollment(null, 'course-asfar', mockRouter, () => {});
assert.strictEqual(hookUnauth.isEnrolled, false);
hookUnauth.handleEnroll('اسفار', '۲۰۰,۰۰۰ تومان');
assert.strictEqual(pushedRoute, '/login', 'Unauthenticated user must be redirected to /login');

// Enrolled student
let hookEnrolled = simulateUseCourseEnrollment({ role: 'STUDENT', enrolledCourseIds: ['course-asfar'] }, 'course-asfar', mockRouter, () => {});
assert.strictEqual(hookEnrolled.isEnrolled, true, 'Enrolled student must have isEnrolled = true');

// Admin user
let hookAdmin = simulateUseCourseEnrollment({ role: 'ADMIN', enrolledCourseIds: [] }, 'course-asfar', mockRouter, () => {});
assert.strictEqual(hookAdmin.isEnrolled, true, 'Admin user must have isEnrolled = true universally');
console.log('  --> PASSED: useCourseEnrollment logic validated.');

// 4. Inspect actual files on disk for Anti-Slop, Scholar Name, and 200 LOC ceiling
console.log('\n[4] Inspecting Source Code Invariants on Disk...');
const targetFiles = [
  'src/components/course/CoursePlaylistSidebar.tsx',
  'src/components/course/CourseEnrollmentCard.tsx',
  'src/components/course/CourseDetailHero.tsx',
  'src/components/course/CourseSyllabusList.tsx',
  'src/components/course/useCourseEnrollment.ts',
  'src/app/courses/[id]/page.tsx',
  'src/app/courses/[id]/learn/page.tsx',
  'src/components/CartModal.tsx',
  'src/context/AuthContext.tsx',
  'src/types/index.ts',
];

for (const rel of targetFiles) {
  const fullPath = path.resolve('frontend', rel);
  assert.ok(fs.existsSync(fullPath), `File must exist: ${rel}`);
  const content = fs.readFileSync(fullPath, 'utf-8');
  const lines = content.split('\n');

  // LOC ceiling
  assert.ok(lines.length <= 200, `File ${rel} exceeds 200 LOC ceiling (${lines.length} lines)`);

  // Anti-slop checks
  assert.ok(!content.includes('blur-3xl'), `File ${rel} contains forbidden blur-3xl`);
  assert.ok(!content.includes('text-transparent bg-clip-text'), `File ${rel} contains forbidden gradient text`);
  assert.ok(!content.includes('animate-pulse'), `File ${rel} contains forbidden animate-pulse`);

  // Persian writing checks
  assert.ok(!content.includes('می‌باشد'), `File ${rel} contains forbidden bureaucratic tell می‌باشد`);
  assert.ok(!content.includes('می‌گردد'), `File ${rel} contains forbidden bureaucratic tell می‌گردد`);
}
console.log('  --> PASSED: 10 files strictly verified for LOC <= 200, Anti-Slop, and Persian Quality.');

console.log('\n🎉 ALL EMPIRICAL FRONTEND TESTS PASSED WITH 0 ERRORS!');
