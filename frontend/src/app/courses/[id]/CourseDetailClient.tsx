'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { CartModal } from '@/components/CartModal';
import { coursesDatabase } from '@/lib/data';
import { getLocalizedCourse } from '@/lib/localization';
import { useData } from '@/context/DataContext';
import { useLanguage } from '@/context/LanguageContext';
import { CourseDetailHero } from '@/components/course/CourseDetailHero';
import { CourseSyllabusAccordion } from '@/components/course/CourseSyllabusAccordion';
import { CourseInstructorCard } from '@/components/course/CourseInstructorCard';
import { CourseFaqAccordion } from '@/components/course/CourseFaqAccordion';
import { CourseEnrollmentCard } from '@/components/course/CourseEnrollmentCard';
import { StickyEnrollmentBar } from '@/components/course/StickyEnrollmentBar';
import { useCourseEnrollment } from '@/components/course/useCourseEnrollment';

export function CourseDetailClient({ courseId }: { courseId: string }) {
  const { courses } = useData();
  const course = courses[courseId] || courses['course-mantiq-mabadi'] || Object.values(coursesDatabase)[0];
  const { currentLang, dict, toLocale } = useLanguage();

  const locCourse = getLocalizedCourse(course, currentLang);
  const title = locCourse?.title || course.title_fa;
  const price = locCourse?.price || course.price_fa || (currentLang === 'en' ? 'Free (Endowment)' : 'رایگان (وقف عام)');

  const {
    isEnrolled,
    isLoading,
    error,
    cartItems,
    isCartOpen,
    openCart,
    closeCart,
    removeItem,
    handleEnroll,
  } = useCourseEnrollment(course.id);

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#8A532B]/20 selection:text-[#8A532B] pb-16 bg-[#FAF8F5] dark:bg-[#0C0D0E] text-zinc-900 dark:text-zinc-100 transition-colors">
      <Navbar cartCount={cartItems.length} onOpenCart={openCart} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 flex-1 w-full text-start">
        {/* Stage 6: Sabzlearn-Inspired 2-Column Hero & Preview Media Player */}
        <CourseDetailHero
          course={course}
          title={title}
          level={locCourse?.level || course.level_fa}
          duration={locCourse?.duration || course.duration_fa}
          sessionsCount={course.chapters?.length || course.episodes_count || 0}
          description={locCourse?.desc || course.desc_fa}
          price={price}
          isEnrolled={isEnrolled}
          isLoading={isLoading}
          onEnroll={() => handleEnroll(title, price)}
          dict={dict}
          currentLang={currentLang}
          toLocale={toLocale}
        />

        {/* Stage 7: Course Syllabus Accordion, Scholar Biography & FAQ Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4 border-t border-[#E6E1D8] dark:border-[#24262D]">
          {/* Main 8-Column Content Flow */}
          <div className="lg:col-span-8 space-y-10">
            <CourseSyllabusAccordion
              course={course}
              chapters={course.chapters || []}
              locChapters={locCourse?.chapters}
              isEnrolled={isEnrolled}
            />

            <CourseInstructorCard />

            <CourseFaqAccordion />
          </div>

          {/* Sticky Enrollment Card Sidebar */}
          <div className="lg:col-span-4 sticky top-24">
            <CourseEnrollmentCard
              courseId={course.id}
              price={price}
              isEnrolled={isEnrolled}
              isLoading={isLoading}
              error={error}
              driveFolderId={course.driveFolderId}
              telegramUrl={course.telegramUrl}
              courseType={course.course_type}
              schedule={course.schedule}
              capacity={course.capacity}
              enrolledCount={course.enrolledCount}
              skyroomUrl={course.skyroomUrl}
              onEnroll={() => handleEnroll(title, price)}
              dict={dict}
              currentLang={currentLang}
            />
          </div>
        </div>
      </main>

      {/* Stage 6: Floating Sticky Enrollment Bar on Scroll */}
      <StickyEnrollmentBar
        course={course}
        title={title}
        price={price}
        isEnrolled={isEnrolled}
        isLoading={isLoading}
        onEnroll={() => handleEnroll(title, price)}
      />

      <CartModal
        isOpen={isCartOpen}
        items={cartItems}
        currentLang={currentLang}
        onClose={closeCart}
        onRemoveItem={removeItem}
      />
    </div>
  );
}
