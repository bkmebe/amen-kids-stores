import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import '../lib/i18n';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 2 * 60 * 1000, // 2 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#1e1b4b',
          color: '#e0e7ff',
          borderRadius: '12px',
          fontSize: '14px',
          border: '1px solid #312e81',
        },
        success: {
          iconTheme: { primary: '#10b981', secondary: '#e0e7ff' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#e0e7ff' },
        },
      }}
    />
  </QueryClientProvider>
);
