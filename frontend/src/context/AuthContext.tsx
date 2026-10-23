'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/services/apiClient';

export type UserRole = 'ADMIN' | 'STUDENT';

export interface UserProfile {
  id: string;
  name: string;
  full_name?: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  avatar_url?: string;
  wallet_balance?: string;
  enrolledCourseIds: string[];
  purchasedBookIds: string[];
  enrolled_courses_count?: number;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (phone: string, password?: string) => Promise<UserProfile>;
  register: (fullName: string, phone: string, password: string) => Promise<UserProfile>;
  logout: () => void;
  enrollCourse: (courseId: string) => Promise<boolean>;
  purchaseBook: (bookId: string) => void;
}

function mapUserResponseToProfile(userRes: any, fallbackName?: string): UserProfile {
  const role: UserRole = userRes.role?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'STUDENT';
  let enrolledIds: string[] = [];
  if (Array.isArray(userRes.enrolled_course_ids)) {
    enrolledIds = userRes.enrolled_course_ids;
  } else if (Array.isArray(userRes.enrolledCourseIds)) {
    enrolledIds = userRes.enrolledCourseIds;
  }
  const finalEnrolledIds = role === 'ADMIN'
    ? Array.from(new Set([...enrolledIds, 'course1', 'course2', 'course3']))
    : enrolledIds;

  return {
    id: userRes.id,
    name: userRes.full_name || fallbackName || 'کاربر',
    full_name: userRes.full_name || fallbackName || 'کاربر',
    phone: userRes.phone || '',
    role,
    avatar: userRes.avatar_url,
    avatar_url: userRes.avatar_url,
    wallet_balance: userRes.wallet_balance || '۰ تومان',
    enrolledCourseIds: finalEnrolledIds,
    purchasedBookIds: role === 'ADMIN' ? ['book1', 'book2', 'book3', 'book4'] : (userRes.purchasedBookIds || ['book1']),
    enrolled_courses_count: typeof userRes.enrolled_courses_count === 'number'
      ? userRes.enrolled_courses_count
      : finalEnrolledIds.length,
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const hydrateSession = async () => {
      if (typeof window === 'undefined') return;
      const token = localStorage.getItem('zanjirzan_token');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const userRes = await apiClient.auth.getMe();
        if (isMounted && userRes) {
          const profile = mapUserResponseToProfile(userRes);
          try {
            const enrolledCourses = await apiClient.courses.getEnrolled();
            if (Array.isArray(enrolledCourses) && enrolledCourses.length > 0) {
              const serverCourseIds = enrolledCourses.map((c: any) => c.id);
              const merged = Array.from(new Set([...profile.enrolledCourseIds, ...serverCourseIds]));
              profile.enrolledCourseIds = merged;
              profile.enrolled_courses_count = merged.length;
            }
          } catch {
            // non-blocking server enrolled sync fallback
          }
          setUser(profile);
          localStorage.setItem('zanjirzan_user', JSON.stringify(profile));
        }
      } catch {
        if (isMounted) {
          setUser(null);
          localStorage.removeItem('zanjirzan_token');
          localStorage.removeItem('zanjirzan_user');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    hydrateSession();
    return () => { isMounted = false; };
  }, []);

  const login = async (phone: string, password: string = ''): Promise<UserProfile> => {
    const userRes = await apiClient.auth.login(phone, password);
    if (userRes.access_token) {
      localStorage.setItem('zanjirzan_token', userRes.access_token);
    }
    const profile = mapUserResponseToProfile(userRes);
    setUser(profile);
    localStorage.setItem('zanjirzan_user', JSON.stringify(profile));
    return profile;
  };

  const register = async (fullName: string, phone: string, password: string): Promise<UserProfile> => {
    const userRes = await apiClient.auth.register(fullName, phone, password);
    if (userRes.access_token) {
      localStorage.setItem('zanjirzan_token', userRes.access_token);
    }
    const profile = mapUserResponseToProfile(userRes, fullName);
    setUser(profile);
    localStorage.setItem('zanjirzan_user', JSON.stringify(profile));
    return profile;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('zanjirzan_token');
    localStorage.removeItem('zanjirzan_user');
  };

  const enrollCourse = async (courseId: string): Promise<boolean> => {
    if (!user) throw new Error('لطفاً ابتدا وارد حساب کاربری خود شوید.');
    if (user.enrolledCourseIds.includes(courseId)) return true;
    try {
      await apiClient.courses.enroll(courseId);
    } catch (err: any) {
      if (err?.error_code !== 'DUPLICATE_ENROLLMENT' && !err?.message?.includes('پیش از این')) {
        throw err;
      }
    }
    const nextIds = Array.from(new Set([...user.enrolledCourseIds, courseId]));
    const updated: UserProfile = {
      ...user,
      enrolledCourseIds: nextIds,
      enrolled_courses_count: nextIds.length,
    };
    setUser(updated);
    localStorage.setItem('zanjirzan_user', JSON.stringify(updated));
    return true;
  };

  const purchaseBook = (bookId: string) => {
    if (!user || user.purchasedBookIds.includes(bookId)) return;
    const updated = { ...user, purchasedBookIds: [...user.purchasedBookIds, bookId] };
    setUser(updated);
    localStorage.setItem('zanjirzan_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'ADMIN',
        isLoading,
        login,
        register,
        logout,
        enrollCourse,
        purchaseBook,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
