import React from 'react';

// Simple loading spinner component
export function LoadingSpinner({ size = 'md', className = '', color = 'black' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const colorClasses = {
    black: 'border-t-black',
    white: 'border-t-white',
    gray: 'border-t-gray-500'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 ${colorClasses[color]} ${sizeClasses[size]} ${className}`}>
    </div>
  );
}

// Full Page Loading
export function PageLoading({ message = 'Loading...' }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
}

// Button Loading State
export function LoadingButton({ loading, children, disabled, className = '', ...props }) {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={`${className} ${loading || disabled ? 'opacity-50 cursor-not-allowed' : ''} relative`}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="sm" color="white" />
        </span>
      )}
      <span className={loading ? 'invisible' : ''}>
        {children}
      </span>
    </button>
  );
}

// Skeleton Components
export function SkeletonLine({ width = 'full', height = 'h-4' }) {
  const widthClasses = {
    '1/4': 'w-1/4',
    '1/3': 'w-1/3',
    '1/2': 'w-1/2',
    '2/3': 'w-2/3',
    '3/4': 'w-3/4',
    'full': 'w-full'
  };

  return (
    <div className={`${height} ${widthClasses[width]} bg-gray-200 rounded animate-pulse`}></div>
  );
}

// Loading skeleton for product cards
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-300 aspect-square rounded-lg mb-3"></div>
      <div className="h-4 bg-gray-300 rounded mb-2"></div>
      <div className="h-3 bg-gray-300 rounded w-3/4"></div>
    </div>
  );
}

// Enhanced Skeleton Card
export function SkeletonCard() {
  return (
    <div className="bg-white border rounded-lg p-6 animate-pulse">
      <div className="h-48 bg-gray-200 rounded mb-4"></div>
      <SkeletonLine width="3/4" height="h-6" />
      <div className="mt-2">
        <SkeletonLine width="1/2" height="h-4" />
      </div>
      <div className="mt-4 flex justify-between items-center">
        <SkeletonLine width="1/4" height="h-5" />
        <div className="h-9 w-24 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLine 
          key={index} 
          width={index === lines - 1 ? '2/3' : 'full'} 
        />
      ))}
    </div>
  );
}

// Loading skeleton for product grid
export function ProductGridSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

// Generic error message component
export function ErrorMessage({ error, onRetry, className = '' }) {
  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="text-red-500 mb-4">
        <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-lg font-medium">Oops! Something went wrong</p>
        <p className="text-sm text-gray-600 mt-1">{error}</p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
        >
          Try Again
        </button>
      )}
    </div>
  );
}

// Empty state component
export function EmptyState({ title, description, actionLabel, onAction, className = '' }) {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="text-gray-400 mb-4">
        <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8V4a1 1 0 00-1-1H7a1 1 0 00-1 1v1m14 0H4" />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}