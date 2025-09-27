import type { QueryFunction } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

import { customAxios } from '@/lib/customAxios';
import { wait } from '@/lib/utils';
import { PurchaseMasterReturn } from '@/types/product';

export type UseGetPurchasesReturn = {
  success: boolean;
  message: string;
  data: {
    data: PurchaseMasterReturn[];
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
};
export const getPurchases: QueryFunction<
  UseGetPurchasesReturn,
  UseGetPurchasesParams
> = async ({ queryKey, signal }) => {
  const axiosRequestConfig: AxiosRequestConfig = {
    signal,
    params: {
      page: queryKey[1].page,
      limit: queryKey[1].limit,
      queryString: queryKey[1].queryString,
      supplierId: queryKey[1].supplierId,
      date_from: queryKey[1].date_from,
      date_to: queryKey[1].date_to,
      categoryId: queryKey[1]?.categoryId,
      price_from: queryKey[1]?.price_from,
      price_to: queryKey[1]?.price_to,
    },
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${queryKey[1].requestToken}`,
    },
  };

  const response = await customAxios.get<UseGetPurchasesReturn>(
    '/purchases',
    axiosRequestConfig
  );
  return response.data;
};

export type UseGetPurchasesParams = [
  string,
  {
    limit: number;
    page: number;
    queryString?: string;
    supplierId?: string;
    requestToken?: string;
    enabled?: boolean;
    date_from?: string;
    date_to?: string;
    categoryId?: string;
    price_from?: number;
    price_to?: number;
    product_id?: string;
    product_code?: string;
  },
];

export const useGetPurchases = (params: UseGetPurchasesParams) => {
  return useQuery({
    queryKey: params,
    queryFn: getPurchases,
    enabled: params[1].enabled,
  });
};

// ===================== get single record
type UseGetPurchaseParams = {
  dataId: number | string;
  requestToken: string;
};
type UseGetPurchaseReturn = {
  success: boolean;
  message: string;
  data: {
    id: number;
    tenant_id: number;
    purchase_no: string;
    purchase_date: Date;
    supplier_id: string;
    supplier: string;
    notes?: string;
    created_by: number;
    updated_by?: Date | null;
    created_at: Date;
    updated_at: Date;
    pd_id: number;
    product_id: number;
    qty: number;
    price: number;
    product_name: string;
    product_code: string;
  }[];
};

export const getPurchase = async (params: UseGetPurchaseParams) => {
  await wait(500);
  const response = await customAxios.get<UseGetPurchaseReturn>(
    `/purchases/${params.dataId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${params.requestToken}`,
      },
    }
  );
  return response.data;
};

export const useGetPurchase = () => {
  return useMutation({
    mutationFn: (params: UseGetPurchaseParams) => getPurchase(params),
  });
};

// ===================== get purchase with details =============================
export const getPurchaseWithDetails = async (params: UseGetPurchaseParams) => {
  await wait(500);
  const response = await customAxios.get<UseGetPurchaseReturn>(
    `/purchase-with-details/${params.dataId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${params.requestToken}`,
      },
    }
  );
  return response.data;
};

export const useGetPurchaseWithDetails = () => {
  return useMutation({
    mutationFn: (params: UseGetPurchaseParams) =>
      getPurchaseWithDetails(params),
  });
};
// ===================== end get purchase with details =============================
