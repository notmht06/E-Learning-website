'use client';

import { CourseCard, CourseCardProps } from '@/components/ui/CourseCard';

export const EDITORIAL_SPRING = {
  type: 'spring' as const,
  stiffness: 420,
  damping: 34,
  mass: 0.75,
};

export type MasterpieceCourseCardProps = CourseCardProps;
export const MasterpieceCourseCard = CourseCard;

export default MasterpieceCourseCard;
