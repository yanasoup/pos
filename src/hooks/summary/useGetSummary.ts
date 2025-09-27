import { QueryFunction } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError, AxiosRequestConfig } from 'axios';

import { customAxios } from '@/lib/customAxios';
import { ApiError } from '@/types/axios';
import { ChartData } from './useChartStats';

export type DataStock = {
  product_name: string;
  image_url: string;
  stok: number;
};

export type UseGetSummaryParams = [
  string,
  {
    enabled: boolean;
    tipe: string;
    date_from?: string;
    date_to?: string;
    requestToken: string;
  },
  string,
];
export type UseGetSummaryReturn = {
  success: boolean;
  message: string;
  data?: {
    count: number;
    amount: number;
  };
  dataStock?: DataStock[];
  dataTopItem?: {
    product_name: string;
    image_url: string;
    count: number;
    amount: number;
  }[];
  dataTopCategory?: {
    image_url: string;
    category_name: string;
    qty: number;
    amount: number;
  }[];
  dataLastSale?: {
    sale_no: string;
    sale_date: string;
    product_name: string;
    qty: number;
    price: number;
  }[];
  chartData?: ChartData[];
};
const getSummary: QueryFunction<
  UseGetSummaryReturn,
  UseGetSummaryParams
> = async ({ queryKey, signal }) => {
  const axiosRequestConfig: AxiosRequestConfig = {
    signal,
    params: {
      tipe: queryKey[1].tipe,
      date_from: queryKey[1].date_from,
      date_to: queryKey[1].date_to,
    },
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${queryKey[1].requestToken}`,
    },
  };

  try {
    const response = await customAxios.get<UseGetSummaryReturn>(
      '/summary',
      axiosRequestConfig
    );
    return response.data;
  } catch (error) {
    // Penanganan error dari Axios
    const axiosError = error as AxiosError<ApiError>;
    if (axiosError.response) {
      // Server merespons dengan status code selain 2xx
      throw new Error(axiosError.response.data.message || 'Permintaan gagal.');
    } else if (axiosError.request) {
      throw new Error(
        'tidak ada response dari server. Harap periksa koneksi internet anda.'
      );
    } else {
      throw new Error(axiosError.message || 'Telah terjadi kesalahan.');
    }
  }
};

export const useGetSummary = (params: UseGetSummaryParams) => {
  return useQuery({
    queryKey: params,
    queryFn: getSummary,
    enabled: params[1].enabled,
  });
};
