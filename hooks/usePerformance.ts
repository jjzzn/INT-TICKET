import { useEffect, useRef } from 'react';
import { reportPerformance } from '../lib/errorHandler';

interface PerformanceMetrics {
  componentName: string;
  renderTime?: number;
  mountTime?: number;
  updateTime?: number;
}

export const usePerformance = (componentName: string) => {
  const mountTimeRef = useRef<number>();
  const renderStartRef = useRef<number>();
  const isFirstRender = useRef(true);

  // Measure component mount time
  useEffect(() => {
    if (isFirstRender.current) {
      mountTimeRef.current = performance.now();
      isFirstRender.current = false;
      
      // Report mount time
      const mountTime = mountTimeRef.current - (performance.timeOrigin || 0);
      reportPerformance(`${componentName}_mount_time`, mountTime, {
        component: componentName,
        type: 'mount'
      });
    }
  }, [componentName]);

  // Measure render time
  const measureRender = () => {
    renderStartRef.current = performance.now();
    
    // Use requestAnimationFrame to measure after render
    requestAnimationFrame(() => {
      if (renderStartRef.current) {
        const renderTime = performance.now() - renderStartRef.current;
        reportPerformance(`${componentName}_render_time`, renderTime, {
          component: componentName,
          type: 'render'
        });
      }
    });
  };

  return { measureRender };
};

// Hook for measuring API call performance
export const useApiPerformance = () => {
  const measureApiCall = async <T>(
    apiName: string,
    apiCall: () => Promise<T>
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;
      
      reportPerformance(`api_${apiName}_success`, duration, {
        api: apiName,
        type: 'api_success'
      });
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      
      reportPerformance(`api_${apiName}_error`, duration, {
        api: apiName,
        type: 'api_error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  };

  return { measureApiCall };
};

// Hook for measuring user interactions
export const useInteractionPerformance = () => {
  const measureInteraction = (
    interactionName: string,
    callback: () => void | Promise<void>
  ) => {
    return async () => {
      const startTime = performance.now();
      
      try {
        await callback();
        const duration = performance.now() - startTime;
        
        reportPerformance(`interaction_${interactionName}`, duration, {
          interaction: interactionName,
          type: 'user_interaction'
        });
      } catch (error) {
        const duration = performance.now() - startTime;
        
        reportPerformance(`interaction_${interactionName}_error`, duration, {
          interaction: interactionName,
          type: 'interaction_error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        
        throw error;
      }
    };
  };

  return { measureInteraction };
};

// Web Vitals monitoring
export const useWebVitals = () => {
  useEffect(() => {
    // Measure Core Web Vitals
    if ('web-vital' in window) {
      // This would integrate with web-vitals library
      // For now, we'll use basic performance API
    }

    // Measure First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'paint') {
          reportPerformance(`web_vital_${entry.name}`, entry.startTime, {
            type: 'web_vital',
            metric: entry.name
          });
        }
      }
    });

    observer.observe({ entryTypes: ['paint'] });

    // Measure Largest Contentful Paint
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      reportPerformance('web_vital_lcp', lastEntry.startTime, {
        type: 'web_vital',
        metric: 'largest-contentful-paint'
      });
    });

    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    return () => {
      observer.disconnect();
      lcpObserver.disconnect();
    };
  }, []);
};
