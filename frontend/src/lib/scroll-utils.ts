// Scroll optimization utilities to prevent jittery scrolling

/**
 * Debounce scroll events to improve performance
 */
export function debounceScroll(callback: () => void, delay: number = 16) {
  let timeoutId: NodeJS.Timeout | null = null;
  
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = setTimeout(() => {
      callback();
      timeoutId = null;
    }, delay);
  };
}

/**
 * Throttle scroll events using requestAnimationFrame for smooth performance
 */
export function throttleScroll(callback: () => void) {
  let ticking = false;
  
  return () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        callback();
        ticking = false;
      });
      ticking = true;
    }
  };
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Optimize scroll behavior based on user preferences and device capabilities
 */
export function optimizeScrollBehavior(element: HTMLElement) {
  // Disable smooth scrolling if user prefers reduced motion
  if (prefersReducedMotion()) {
    element.style.scrollBehavior = 'auto';
  }
  
  // Enable momentum scrolling on iOS (using proper casting)
  (element.style as any).webkitOverflowScrolling = 'touch';
  
  // Contain scroll within element
  element.style.overscrollBehavior = 'contain';
  
  // Use transform hint for better performance
  element.style.willChange = 'transform';
}
