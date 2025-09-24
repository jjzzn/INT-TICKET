import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'spinner' | 'dots' | 'pulse' | 'skeleton';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  text,
  fullScreen = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50'
    : 'flex items-center justify-center p-4';

  const renderSpinner = () => (
    <div className={`animate-spin rounded-full border-2 border-border border-t-primary ${sizeClasses[size]}`} />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`bg-primary rounded-full animate-pulse ${
            size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-5 h-5'
          }`}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div className={`bg-primary rounded-full animate-pulse ${sizeClasses[size]}`} />
  );

  const renderSkeleton = () => (
    <div className="space-y-3 w-full max-w-sm">
      <div className="h-4 bg-border rounded animate-pulse" />
      <div className="h-4 bg-border rounded animate-pulse w-3/4" />
      <div className="h-4 bg-border rounded animate-pulse w-1/2" />
    </div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      case 'skeleton':
        return renderSkeleton();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="flex flex-col items-center space-y-3">
        {renderLoader()}
        {text && (
          <p className="text-text-secondary text-sm font-medium animate-pulse">
            {text}
          </p>
        )}
      </div>
    </div>
  );
};

// Skeleton components for specific use cases
export const EventCardSkeleton: React.FC = () => (
  <div className="bg-card rounded-lg border border-border overflow-hidden animate-pulse">
    <div className="h-48 bg-border" />
    <div className="p-4 space-y-3">
      <div className="h-6 bg-border rounded w-3/4" />
      <div className="h-4 bg-border rounded w-1/2" />
      <div className="h-4 bg-border rounded w-2/3" />
      <div className="flex justify-between items-center mt-4">
        <div className="h-4 bg-border rounded w-1/4" />
        <div className="h-8 bg-border rounded w-20" />
      </div>
    </div>
  </div>
);

export const DashboardSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header */}
    <div className="h-8 bg-border rounded w-1/3" />
    
    {/* Stats Cards */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card p-6 rounded-lg border border-border">
          <div className="h-4 bg-border rounded w-1/2 mb-2" />
          <div className="h-8 bg-border rounded w-3/4" />
        </div>
      ))}
    </div>
    
    {/* Chart */}
    <div className="bg-card p-6 rounded-lg border border-border">
      <div className="h-6 bg-border rounded w-1/4 mb-4" />
      <div className="h-64 bg-border rounded" />
    </div>
    
    {/* Table */}
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="h-6 bg-border rounded w-1/4" />
      </div>
      <div className="divide-y divide-border">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 flex justify-between items-center">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-border rounded w-1/3" />
              <div className="h-3 bg-border rounded w-1/4" />
            </div>
            <div className="h-8 bg-border rounded w-16" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const FormSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-8 bg-border rounded w-1/3" />
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-border rounded w-1/4" />
          <div className="h-10 bg-border rounded" />
        </div>
      ))}
    </div>
    
    <div className="space-y-2">
      <div className="h-4 bg-border rounded w-1/6" />
      <div className="h-24 bg-border rounded" />
    </div>
    
    <div className="flex justify-end space-x-3">
      <div className="h-10 bg-border rounded w-20" />
      <div className="h-10 bg-border rounded w-24" />
    </div>
  </div>
);

export default Loading;
