// src/components/ui/skeleton.tsx
import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '',
  width,
  height
}) => {
  const style: React.CSSProperties = {};
  if (width) style.width = width;
  if (height) style.height = height;
  
  return (
    <div 
      className={`bg-gray-200 dark:bg-gray-700 rounded animate-pulse ${className}`}
      style={style}
    />
  );
};