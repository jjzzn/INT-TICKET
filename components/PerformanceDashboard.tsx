import React, { useState, useEffect } from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'poor';
  threshold: number;
}

interface PerformanceDashboardProps {
  className?: string;
}

const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({ className = '' }) => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development mode and when manually enabled
    if (import.meta.env.DEV && isVisible) {
      collectMetrics();
      const interval = setInterval(collectMetrics, 5000); // Update every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const collectMetrics = () => {
    const newMetrics: PerformanceMetric[] = [];

    // Memory usage
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMemory = memory.usedJSHeapSize / 1024 / 1024; // MB
      newMetrics.push({
        name: 'Memory Usage',
        value: Math.round(usedMemory),
        unit: 'MB',
        status: usedMemory > 50 ? 'warning' : usedMemory > 100 ? 'poor' : 'good',
        threshold: 50
      });
    }

    // FPS (approximate)
    let fps = 0;
    let lastTime = performance.now();
    const measureFPS = () => {
      const currentTime = performance.now();
      fps = Math.round(1000 / (currentTime - lastTime));
      lastTime = currentTime;
    };
    measureFPS();
    
    newMetrics.push({
      name: 'FPS',
      value: fps,
      unit: 'fps',
      status: fps < 30 ? 'poor' : fps < 50 ? 'warning' : 'good',
      threshold: 50
    });

    // DOM nodes count
    const domNodes = document.querySelectorAll('*').length;
    newMetrics.push({
      name: 'DOM Nodes',
      value: domNodes,
      unit: 'nodes',
      status: domNodes > 1500 ? 'warning' : domNodes > 3000 ? 'poor' : 'good',
      threshold: 1500
    });

    // Bundle size (approximate from script tags)
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    const bundleSize = scripts.length * 100; // Rough estimate
    newMetrics.push({
      name: 'Bundle Size',
      value: bundleSize,
      unit: 'KB',
      status: bundleSize > 500 ? 'warning' : bundleSize > 1000 ? 'poor' : 'good',
      threshold: 500
    });

    setMetrics(newMetrics);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'poor':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (!import.meta.env.DEV || !isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 transition-colors z-50 flex items-center justify-center"
        title="Show Performance Dashboard"
      >
        📊
      </button>
    );
  }

  return (
    <div className={`fixed bottom-4 right-4 w-80 bg-card border border-border rounded-lg shadow-xl z-50 ${className}`}>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h3 className="font-semibold text-text-primary">Performance Monitor</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          ✕
        </button>
      </div>
      
      <div className="p-4 space-y-3">
        {metrics.map((metric) => (
          <div key={metric.name} className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">{metric.name}</span>
                <span className={`px-2 py-1 text-xs rounded-full border ${getStatusColor(metric.status)}`}>
                  {metric.value} {metric.unit}
                </span>
              </div>
              <div className="mt-1 w-full bg-border rounded-full h-1">
                <div
                  className={`h-1 rounded-full transition-all duration-300 ${
                    metric.status === 'good' ? 'bg-green-500' :
                    metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{
                    width: `${Math.min((metric.value / metric.threshold) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          </div>
        ))}
        
        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <span>Updated: {new Date().toLocaleTimeString()}</span>
            <button
              onClick={collectMetrics}
              className="text-primary hover:text-primary/80 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceDashboard;
