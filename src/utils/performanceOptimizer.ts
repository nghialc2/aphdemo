// Advanced performance optimization utilities
// Maintains full quality while improving loading speed

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private resourceCache = new Map<string, boolean>();
  private loadingPromises = new Map<string, Promise<void>>();

  static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  // Intelligent resource preloading
  preloadResource(url: string, type: 'video' | 'script' | 'style' | 'fetch', priority: 'high' | 'low' = 'high'): Promise<void> {
    if (this.resourceCache.has(url)) {
      return Promise.resolve();
    }

    if (this.loadingPromises.has(url)) {
      return this.loadingPromises.get(url)!;
    }

    const promise = this.createPreloadPromise(url, type, priority);
    this.loadingPromises.set(url, promise);
    
    promise.then(() => {
      this.resourceCache.set(url, true);
      this.loadingPromises.delete(url);
    }).catch(() => {
      this.loadingPromises.delete(url);
    });

    return promise;
  }

  private createPreloadPromise(url: string, type: string, priority: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const link = document.createElement('link');
      link.rel = priority === 'high' ? 'preload' : 'prefetch';
      link.href = url;
      
      switch (type) {
        case 'video':
          link.as = 'video';
          break;
        case 'script':
          link.as = 'script';
          break;
        case 'style':
          link.as = 'style';
          break;
        case 'fetch':
          link.as = 'fetch';
          link.crossOrigin = 'anonymous';
          break;
      }

      link.onload = () => resolve();
      link.onerror = () => reject();
      
      document.head.appendChild(link);
    });
  }

  // Smart idle time utilization
  runWhenIdle(callback: () => void, timeout: number = 5000): void {
    if (window.requestIdleCallback) {
      window.requestIdleCallback(callback, { timeout });
    } else {
      setTimeout(callback, 16); // Next frame fallback
    }
  }

  // Resource hints for CDN optimization
  addResourceHints(resources: { url: string; type: 'dns-prefetch' | 'preconnect' }[]): void {
    const head = document.head;
    
    resources.forEach(({ url, type }) => {
      // Avoid duplicates
      if (head.querySelector(`link[rel="${type}"][href="${url}"]`)) {
        return;
      }

      const link = document.createElement('link');
      link.rel = type;
      link.href = url;
      
      if (type === 'preconnect') {
        link.crossOrigin = 'anonymous';
      }
      
      head.appendChild(link);
    });
  }

  // Memory-efficient intersection observer
  createLazyLoader(callback: (entry: IntersectionObserverEntry) => void, rootMargin: string = '50px'): IntersectionObserver {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry);
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin,
      threshold: 0.1
    });

    return observer;
  }

  // Progressive image/video loading
  optimizeMediaLoading(mediaElement: HTMLVideoElement | HTMLImageElement): void {
    // Add loading="lazy" for images
    if (mediaElement instanceof HTMLImageElement) {
      mediaElement.loading = 'lazy';
    }

    // Optimize video loading
    if (mediaElement instanceof HTMLVideoElement) {
      // Use metadata preload initially
      mediaElement.preload = 'metadata';
      
      // Upgrade to full preload when in viewport
      const observer = this.createLazyLoader(() => {
        mediaElement.preload = 'auto';
      });
      
      observer.observe(mediaElement);
    }
  }

  // Service Worker caching strategy
  enableServiceWorkerCaching(): void {
    if ('serviceWorker' in navigator) {
      this.runWhenIdle(() => {
        navigator.serviceWorker.register('/sw.js').catch(console.error);
      });
    }
  }

  // Critical CSS optimization
  optimizeCriticalCSS(): void {
    // Move non-critical CSS to load after page render
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    
    stylesheets.forEach((link) => {
      const href = (link as HTMLLinkElement).href;
      if (!href.includes('critical')) {
        (link as HTMLLinkElement).media = 'print';
        (link as HTMLLinkElement).onload = () => {
          (link as HTMLLinkElement).media = 'all';
        };
      }
    });
  }
}

// Global performance optimizer instance
export const perfOptimizer = PerformanceOptimizer.getInstance();

// Auto-initialize common optimizations
if (typeof window !== 'undefined') {
  // Add CDN hints
  perfOptimizer.addResourceHints([
    { url: 'https://unpkg.com', type: 'preconnect' },
    { url: 'https://prod.spline.design', type: 'preconnect' },
    { url: 'https://fonts.googleapis.com', type: 'preconnect' },
    { url: 'https://fonts.gstatic.com', type: 'preconnect' }
  ]);

  // Enable service worker caching
  perfOptimizer.enableServiceWorkerCaching();
}