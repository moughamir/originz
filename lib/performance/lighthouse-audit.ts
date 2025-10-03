/**
 * Lighthouse Performance Audit System
 * Automated performance monitoring and optimization
 */

export interface LighthouseMetrics {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  pwa: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
  speedIndex: number;
  totalBlockingTime: number;
}

export interface PerformanceBudget {
  maxBundleSize: number;
  maxImageSize: number;
  maxFontSize: number;
  maxCssSize: number;
  maxJsSize: number;
  maxTotalSize: number;
}

export class PerformanceAuditor {
  private budget: PerformanceBudget;

  constructor(budget: PerformanceBudget) {
    this.budget = budget;
  }

  /**
   * Analyze bundle sizes against performance budget
   */
  analyzeBundleSize(bundleStats: any): {
    passed: boolean;
    violations: Array<{
      type: string;
      actual: number;
      budget: number;
      severity: 'error' | 'warning';
    }>;
  } {
    const violations: any[] = [];

    // Check JavaScript bundle size
    if (bundleStats.js > this.budget.maxJsSize) {
      violations.push({
        type: 'JavaScript',
        actual: bundleStats.js,
        budget: this.budget.maxJsSize,
        severity: bundleStats.js > this.budget.maxJsSize * 1.2 ? 'error' : 'warning',
      });
    }

    // Check CSS bundle size
    if (bundleStats.css > this.budget.maxCssSize) {
      violations.push({
        type: 'CSS',
        actual: bundleStats.css,
        budget: this.budget.maxCssSize,
        severity: bundleStats.css > this.budget.maxCssSize * 1.2 ? 'error' : 'warning',
      });
    }

    // Check total bundle size
    const totalSize = bundleStats.js + bundleStats.css;
    if (totalSize > this.budget.maxTotalSize) {
      violations.push({
        type: 'Total Bundle',
        actual: totalSize,
        budget: this.budget.maxTotalSize,
        severity: totalSize > this.budget.maxTotalSize * 1.2 ? 'error' : 'warning',
      });
    }

    return {
      passed: violations.length === 0,
      violations,
    };
  }

  /**
   * Generate performance optimization recommendations
   */
  generateRecommendations(metrics: LighthouseMetrics): string[] {
    const recommendations: string[] = [];

    // Performance recommendations
    if (metrics.firstContentfulPaint > 2000) {
      recommendations.push('Optimize First Contentful Paint: Consider code splitting and lazy loading');
    }

    if (metrics.largestContentfulPaint > 4000) {
      recommendations.push('Optimize Largest Contentful Paint: Optimize images and critical resources');
    }

    if (metrics.firstInputDelay > 100) {
      recommendations.push('Reduce First Input Delay: Minimize JavaScript execution time');
    }

    if (metrics.cumulativeLayoutShift > 0.1) {
      recommendations.push('Reduce Cumulative Layout Shift: Add size attributes to images and videos');
    }

    if (metrics.speedIndex > 4000) {
      recommendations.push('Improve Speed Index: Optimize above-the-fold content');
    }

    if (metrics.totalBlockingTime > 300) {
      recommendations.push('Reduce Total Blocking Time: Split large JavaScript bundles');
    }

    // Accessibility recommendations
    if (metrics.accessibility < 90) {
      recommendations.push('Improve Accessibility: Add alt text to images and proper ARIA labels');
    }

    // SEO recommendations
    if (metrics.seo < 90) {
      recommendations.push('Improve SEO: Add meta descriptions and structured data');
    }

    return recommendations;
  }

  /**
   * Calculate performance score
   */
  calculateScore(metrics: LighthouseMetrics): number {
    const weights = {
      performance: 0.4,
      accessibility: 0.2,
      bestPractices: 0.2,
      seo: 0.2,
    };

    return Math.round(
      metrics.performance * weights.performance +
      metrics.accessibility * weights.accessibility +
      metrics.bestPractices * weights.bestPractices +
      metrics.seo * weights.seo
    );
  }
}

// Pre-configured performance budgets
export const performanceBudgets = {
  mobile: {
    maxBundleSize: 250000, // 250KB
    maxImageSize: 1000000, // 1MB
    maxFontSize: 100000, // 100KB
    maxCssSize: 50000, // 50KB
    maxJsSize: 200000, // 200KB
    maxTotalSize: 300000, // 300KB
  },
  desktop: {
    maxBundleSize: 500000, // 500KB
    maxImageSize: 2000000, // 2MB
    maxFontSize: 200000, // 200KB
    maxCssSize: 100000, // 100KB
    maxJsSize: 400000, // 400KB
    maxTotalSize: 600000, // 600KB
  },
};

// Performance monitoring utilities
export class PerformanceMonitor {
  private observer: PerformanceObserver | null = null;
  private metrics: Map<string, number> = new Map();

  constructor() {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      this.initializeObserver();
    }
  }

  private initializeObserver() {
    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        this.recordMetric(entry);
      }
    });

    // Observe different types of performance entries
    this.observer.observe({ entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input'] });
  }

  private recordMetric(entry: PerformanceEntry) {
    const name = entry.name || entry.entryType;
    this.metrics.set(name, entry.startTime);
  }

  /**
   * Get Core Web Vitals metrics
   */
  getCoreWebVitals(): {
    lcp: number | null;
    fid: number | null;
    cls: number | null;
  } {
    return {
      lcp: this.metrics.get('largest-contentful-paint') || null,
      fid: this.metrics.get('first-input') || null,
      cls: this.calculateCLS(),
    };
  }

  private calculateCLS(): number {
    // Simplified CLS calculation
    // In a real implementation, you'd track layout shifts
    return 0;
  }

  /**
   * Get performance metrics for reporting
   */
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }

  /**
   * Send metrics to analytics
   */
  reportMetrics(endpoint: string) {
    const metrics = this.getMetrics();
    
    if (typeof fetch !== 'undefined') {
      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics,
          timestamp: Date.now(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      }).catch(console.error);
    }
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// Image optimization utilities
export class ImageOptimizer {
  /**
   * Generate responsive image sources
   */
  static generateResponsiveSources(src: string, sizes: number[] = [320, 640, 768, 1024, 1280]): string {
    return sizes
      .map(size => `${src}?w=${size}&q=80 ${size}w`)
      .join(', ');
  }

  /**
   * Check if image needs optimization
   */
  static needsOptimization(file: File): boolean {
    const maxSize = 500000; // 500KB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    
    return file.size > maxSize || !allowedTypes.includes(file.type);
  }

  /**
   * Optimize image before upload
   */
  static async optimizeImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const { width, height } = img;
        const aspectRatio = width / height;
        
        let newWidth = width;
        let newHeight = height;

        if (width > maxWidth) {
          newWidth = maxWidth;
          newHeight = newWidth / aspectRatio;
        }

        canvas.width = newWidth;
        canvas.height = newHeight;

        ctx?.drawImage(img, 0, 0, newWidth, newHeight);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const optimizedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(optimizedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }
}

// Bundle analysis utilities
export class BundleAnalyzer {
  /**
   * Analyze webpack bundle
   */
  static analyzeBundle(bundleStats: any): {
    totalSize: number;
    largestChunks: Array<{ name: string; size: number }>;
    duplicateModules: string[];
    recommendations: string[];
  } {
    const chunks = bundleStats.chunks || [];
    const modules = bundleStats.modules || [];

    // Find largest chunks
    const largestChunks = chunks
      .sort((a: any, b: any) => b.size - a.size)
      .slice(0, 5)
      .map((chunk: any) => ({
        name: chunk.name || chunk.id,
        size: chunk.size,
      }));

    // Find duplicate modules
    const moduleCounts = new Map<string, number>();
    modules.forEach((module: any) => {
      const count = moduleCounts.get(module.name) || 0;
      moduleCounts.set(module.name, count + 1);
    });

    const duplicateModules = Array.from(moduleCounts.entries())
      .filter(([, count]) => count > 1)
      .map(([name]) => name);

    // Generate recommendations
    const recommendations: string[] = [];
    
    if (largestChunks[0]?.size > 200000) {
      recommendations.push('Consider code splitting for large chunks');
    }
    
    if (duplicateModules.length > 0) {
      recommendations.push('Remove duplicate modules to reduce bundle size');
    }

    return {
      totalSize: chunks.reduce((total: number, chunk: any) => total + chunk.size, 0),
      largestChunks,
      duplicateModules,
      recommendations,
    };
  }
}