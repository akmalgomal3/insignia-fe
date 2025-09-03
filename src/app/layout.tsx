// src/app/layout.tsx
import React from 'react';
import Navigation from '@/components/layout/navigation';
import { ToastProvider } from '@/components/context/toast-context';
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Insignia Task Scheduler',
  description: 'A modern task scheduler application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-gray-100 dark:bg-gray-900">
      <body className="h-full">
        <ToastProvider>
          <div className="min-h-full">
            <Navigation />
            <div className="py-10">
              <main>
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                  {children}
                </div>
              </main>
            </div>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}