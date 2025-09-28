import type { QueryFunction } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { AxiosError, AxiosRequestConfig } from 'axios';
// import { format, parseISO } from 'date-fns';

import { customAxios } from '@/lib/customAxios';
import { wait } from '@/lib/utils';
import { ApiError } from '@/types/axios';
import { SaleMasterReturn } from '@/types/product';

type UseGetSalesReturn = {
  success: boolean;
  message: string;
  data: {
    data: SaleMasterReturn[];
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
};
export const getSales: QueryFunction<
  UseGetSalesReturn,
  UseGetSalesParams
> = async ({ queryKey, signal }) => {
  const axiosRequestConfig: AxiosRequestConfig = {
    signal,
    params: {
      page: queryKey[1].page,
      limit: queryKey[1].limit,
      queryString: queryKey[1].queryString,
      customerId: queryKey[1].customerId,
      date_from: queryKey[1].date_from,
      date_to: queryKey[1].date_to,
      categoryId: queryKey[1]?.categoryId,
      price_from: queryKey[1]?.price_from,
      price_to: queryKey[1]?.price_to,
      product_id: queryKey[1]?.product_id,
      product_code: queryKey[1]?.product_code,
      cashier: queryKey[1]?.cashier,
    },
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${queryKey[1].requestToken}`,
    },
  };

  try {
    const response = await customAxios.get<UseGetSalesReturn>(
      '/sales',
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

export type UseGetSalesParams = [
  string,
  {
    limit: number;
    page: number;
    queryString?: string;
    customerId?: string;
    requestToken?: string;
    enabled?: boolean;
    date_from?: string;
    date_to?: string;
    categoryId?: string;
    price_from?: number;
    price_to?: number;
    product_id?: string;
    product_code?: string;
    cashier?: string;
  },
];

export const useGetSales = (params: UseGetSalesParams) => {
  return useQuery({
    queryKey: params,
    queryFn: getSales,
    enabled: params[1].enabled,
  });
};

// ===================== get single record
type UseGetSaleReturn = {
  success: boolean;
  message: string;
  data: {
    id: number;
    tenant_id: number;
    sale_no: string;
    sale_date: Date;
    customer: string;
    notes?: string;
    created_by: number;
    updated_by?: Date | null;
    created_at: Date;
    updated_at: Date;
    sd_id: number;
    product_id: number;
    qty: number;
    price: number;
    price_cogs: number;
    product_name: string;
    product_code: string;
  }[];
};

export const getSaleDetails: QueryFunction<
  UseGetSaleReturn,
  UseGetSaleDetailsParams
> = async ({ queryKey, signal }) => {
  await wait(1000);
  const axiosRequestConfig: AxiosRequestConfig = {
    signal,
    params: {
      // masterId: queryKey[1].masterId,
    },
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${queryKey[2]}`,
    },
  };

  const response = await customAxios.get<UseGetSaleReturn>(
    `/sale-with-details/${queryKey[1].masterId}`,
    axiosRequestConfig
  );
  return response.data;
};

export type UseGetSaleDetailsParams = [
  string,
  {
    masterId: string | number;
    limit: number;
    page: number;
    queryString?: string;
  },
  string,
];

export const useGetSaleDetails = (paramInput: UseGetSaleDetailsParams) => {
  const config = {
    queryKey: paramInput,
    queryFn: getSaleDetails,
    enabled: !!paramInput[1]?.masterId,
  };
  return useQuery(config);
};
