import { useEffect, useRef, RefObject } from 'react';
import { throttleScroll, optimizeScrollBehavior } from '@/lib/scroll-utils';

interface UseScrollOptimizationOptions {
  throttleDelay?: number;
  enableOptimization?: boolean;
  onScroll?: () => void;
}

/**
 * Hook to optimize scroll performance for any scrollable element
 */
export function useScrollOptimization<T extends HTMLElement>(
  options: UseScrollOptimizationOptions = {}
): RefObject<T> {
  const {
    throttleDelay = 16,
    enableOptimization = true,
    onScroll
  } = options;

  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enableOptimization) return;

    // Apply scroll optimizations
    optimizeScrollBehavior(element);

    if (onScroll) {
      const throttledScrollHandler = throttleScroll(onScroll);
      
      element.addEventListener('scroll', throttledScrollHandler, { passive: true });
      
      return () => {
        element.removeEventListener('scroll', throttledScrollHandler);
      };
    }
  }, [enableOptimization, onScroll]);

  return elementRef;
}

/**
 * Hook to detect if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const prefersReducedMotionRef = useRef<boolean>(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReducedMotionRef.current = mediaQuery.matches;

    const handleChange = (e: MediaQueryListEvent) => {
      prefersReducedMotionRef.current = e.matches;
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return prefersReducedMotionRef.current;
}
