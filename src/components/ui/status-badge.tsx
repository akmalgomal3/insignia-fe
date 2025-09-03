// src/components/ui/status-badge.tsx
import React from 'react';

interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'deleted' | 'success' | 'failed';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const statusConfig = {
    active: { text: 'Active', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
    inactive: { text: 'Inactive', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100' },
    deleted: { text: 'Deleted', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' },
    success: { text: 'Success', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' },
    failed: { text: 'Failed', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100' },
  };

  const config = statusConfig[status] || { text: status, className: 'bg-gray-100 text-gray-800' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className} ${className}`}>
      {config.text}
    </span>
  );
};