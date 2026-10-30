'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

export function useCourseEnrollment(courseId: string) {
  const router = useRouter();
  const { localizeHref } = useLanguage();
  const { user, enrollCourse } = useAuth();
  const {
    items: cartItems,
    isOpen: isCartOpen,
    openCart,
    closeCart,
    addItem,
    removeItem,
  } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEnrolled = !!user && (user.role === 'ADMIN' || user.enrolledCourseIds.includes(courseId));

  const handleEnroll = async (title: string, price: string) => {
    if (!user) {
      router.push(localizeHref('/login'));
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      await enrollCourse(courseId);
      addItem({
        id: courseId,
        title: `ثبت‌نام: ${title}`,
        price,
        type: 'course',
        itemType: 'course',
      });
    } catch (err: any) {
      setError(err?.message || 'خطا در ثبت‌نام دوره. لطفاً مجدداً تلاش کنید.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    user,
    isEnrolled,
    isLoading,
    error,
    cartItems,
    isCartOpen,
    openCart,
    closeCart,
    removeItem,
    handleEnroll,
  };
}
