import https from 'https';

import axios from 'axios';
import { toast } from 'sonner';

import { store } from '@/redux/store';
import { resetState } from '@/redux/ui-slice';

export const localAxios = axios.create({
  baseURL: '/api',
  // withCredentials: true,
  // withXSRFToken: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: '*',
  },
  httpsAgent: new https.Agent({ rejectUnauthorized: false }),
});

localAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (
        typeof window !== 'undefined' &&
        window.location.pathname !== '/login'
      ) {
        const resetAuth = async () => {
          toast.error('Sesi Anda sudah habis. Silakan login kembali.');
          store.dispatch(resetState());
          window.location.href = '/login';
        };
        resetAuth();
      }

      return false;
    }

    return Promise.reject(error);
  }
);
