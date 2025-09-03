// src/components/ui/table.tsx
import React from 'react';

interface TableProps {
  headers: string[];
  rows: React.ReactNode[][];
  className?: string;
}

export const Table: React.FC<TableProps> = ({ headers, rows, className = '' }) => {
  return (
    <div className={`overflow-x-auto rounded-lg shadow ${className}`}>
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
          {rows.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              className={rowIndex % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
            >
              {row.map((cell, cellIndex) => (
                <td 
                  key={cellIndex} 
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};