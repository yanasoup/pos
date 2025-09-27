'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { Toaster } from '@/components/ui/sonner';

import { store, persistor } from '@/redux/store';

import { ThemeProvider } from './theme-provider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // kalau error ada response 401 → jangan retry
        if (error?.response?.status === 401) {
          /*if (
            typeof window !== 'undefined' &&
            window.location.pathname !== '/login'
          ) {
            const resetAuth = async () => {
              // console.log('Sesi Habis:', failureCount);
              toast.error('Sesi Anda sudah habis. Silakan login kembali.');
              store.dispatch(resetState());
              window.location.href = '/login';
            };
            resetAuth();
          }*/
          return false;
        }
        // selain itu → retry max 2x
        return failureCount < 2;
      },

      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <Toaster richColors position='top-center' />
            {children}
          </ThemeProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
