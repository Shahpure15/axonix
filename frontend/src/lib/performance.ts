// Performance monitoring utilities
export function measurePerformance(name: string, fn: () => void) {
  if (typeof window !== 'undefined' && 'performance' in window) {
    performance.mark(`${name}-start`);
    fn();
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name)[0];
    console.log(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`);
  } else {
    fn();
  }
}

export function logBundleSize() {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if ('transferSize' in entry) {
          const resourceEntry = entry as PerformanceResourceTiming;
          console.log(`📦 ${entry.name}: ${(resourceEntry.transferSize / 1024).toFixed(2)}KB`);
        }
      });
    });
    observer.observe({ entryTypes: ['resource'] });
  }
}
