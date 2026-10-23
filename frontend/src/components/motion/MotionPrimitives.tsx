'use client';

import React from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'motion/react';

// Precision spring physics tailored for high-end editorial feel (60fps, no jitter)
export const springTransition = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 32,
  mass: 0.8,
};

export const gentleSpring = {
  type: 'spring' as const,
  stiffness: 260,
  damping: 24,
};

export const smoothFade = {
  duration: 0.28,
  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
};

// 1. Fluid Sliding Tabs with layoutId Spring
export interface FluidTabItem {
  id: string;
  label: string;
  count?: number | string;
  icon?: React.ReactNode;
}

interface FluidTabsProps {
  tabs: FluidTabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
  tabClassName?: string;
  layoutId?: string;
}

export const FluidTabs: React.FC<FluidTabsProps> = ({
  tabs,
  activeId,
  onChange,
  className = '',
  tabClassName = '',
  layoutId = 'activeFluidTabIndicator',
}) => {
  return (
    <div
      className={`inline-flex items-center p-1 rounded-xl bg-stone-100/80 dark:bg-stone-900/80 border border-stone-200/80 dark:border-neutral-800/80 backdrop-blur-xs relative select-none ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={`relative px-3.5 py-2 rounded-lg text-xs font-bold transition-colors z-10 flex items-center gap-2 cursor-pointer ${
              isActive
                ? 'text-[#FAF8F5] dark:text-[#0C0D0E]'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            } ${tabClassName}`}
          >
            {isActive && (
              <motion.div
                layoutId={layoutId}
                transition={springTransition}
                className="absolute inset-0 rounded-lg bg-[#8A532B] dark:bg-[#C58B43] shadow-xs z-[-1]"
              />
            )}
            {tab.icon && <span className="w-3.5 h-3.5">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-2 py-0.2 rounded-full font-num transition-colors ${
                  isActive
                    ? 'bg-black/20 text-white dark:text-black dark:bg-white/30'
                    : 'bg-stone-200/80 dark:bg-neutral-800 text-stone-500'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

// 2. Fluid Modal Container with Spring Physics & Clean Backdrop
interface FluidModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

export const FluidModal: React.FC<FluidModalProps> = ({
  isOpen,
  onClose,
  children,
  className = '',
  maxWidth = 'max-w-md',
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={smoothFade}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
          />

          {/* Dialog Body */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={springTransition}
            className={`relative w-full ${maxWidth} bg-[#FAF8F5] dark:bg-[#121316] border border-stone-200/90 dark:border-neutral-800/90 rounded-2xl shadow-2xl overflow-hidden z-10 ${className}`}
          >
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// 3. Stagger Container and Stagger Item for Lists & Grids
export const StaggerContainer: React.FC<{
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}> = ({ children, className = '', staggerDelay = 0.05 }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 10 },
        visible: {
          opacity: 1,
          y: 0,
          transition: springTransition,
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// 4. Subtle Tactile Press Wrapper for Interactive Buttons & Cards
export const TactilePress: React.FC<HTMLMotionProps<'div'>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98, y: 0 }}
      transition={{ type: 'spring', stiffness: 450, damping: 25 }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
};
