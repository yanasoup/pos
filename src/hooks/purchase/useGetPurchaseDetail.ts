import type { QueryFunction } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

import { customAxios } from '@/lib/customAxios';
import { wait } from '@/lib/utils';
import { PurchaseDetailreturn, PurchaseReportReturn } from '@/types/product';

export type UseGetPurchaseDetailsReturn = {
  success: boolean;
  message: string;
  data: {
    id: string;
    tenant_id: number;
    purchase_no: string;
    purchase_date: Date;
    supplier: string;
    supplier_id: string;
    notes?: string;
    created_by: number;
    updated_by?: Date | null;
    created_at: Date;
    updated_at: Date;
    pd_id: string;
    product_id: string;
    qty: number;
    price: number;
    sale_price: number;
    product_name: string;
    product_code: string;
  }[];
};

export const getPurchaseDetails: QueryFunction<
  UseGetPurchaseDetailsReturn,
  UseGetPurchaseDetailsParams
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

  const response = await customAxios.get<UseGetPurchaseDetailsReturn>(
    `/purchase-with-details/${queryKey[1].masterId}`,
    axiosRequestConfig
  );
  return response.data;
};

export type UseGetPurchaseDetailsParams = [
  string,
  {
    masterId: string | number;
    limit: number;
    page: number;
    queryString?: string;
  },
  string,
];

export const useGetPurchaseDetails = (
  paramInput: UseGetPurchaseDetailsParams
) => {
  const config = {
    queryKey: paramInput,
    queryFn: getPurchaseDetails,
    enabled: !!paramInput[1]?.masterId,
  };
  return useQuery(config);
};

// ===================== get single record
type UseGetPurchaseDetailParams = {
  dataId: number | string;
  requestToken: string;
};
type UseGetPurchaseDetailReturn = {
  success: boolean;
  message: string;
  data: PurchaseDetailreturn[];
};

export const getPurchaseDetail = async (params: UseGetPurchaseDetailParams) => {
  // await wait(2000);
  const response = await customAxios.get<UseGetPurchaseDetailReturn>(
    `/purchase-details/${params.dataId}`,
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

export const useGetPurchaseDetail = () => {
  return useMutation({
    mutationFn: (params: UseGetPurchaseDetailParams) =>
      getPurchaseDetail(params),
  });
};

export const useGetPurchase = () => {
  return useMutation({
    mutationFn: async ({
      purchaseId,
      requestToken,
    }: {
      purchaseId: string;
      requestToken: string;
    }) => {
      const response = await customAxios.get(
        '/purchase-with-details/' + purchaseId,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${requestToken}`,
          },
        }
      );
      return response.data;
    },
  });
};

// ===== get report ====
type UseGetPurchasesReportReturn = {
  success: boolean;
  message: string;
  data: {
    data: PurchaseReportReturn[];
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
};

export const getPurchasesReport: QueryFunction<
  UseGetPurchasesReportReturn,
  UseGetPurchasesReportParams
> = async ({ queryKey, signal }) => {
  await wait(1000);
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
      product_code: queryKey[1]?.product_code,
    },
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${queryKey[1].requestToken}`,
    },
  };

  const response = await customAxios.get<UseGetPurchasesReportReturn>(
    `/purchase-details`,
    axiosRequestConfig
  );
  return response.data;
};

export type UseGetPurchasesReportParams = [
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

export const useGetPurchasesReport = (
  paramInput: UseGetPurchasesReportParams
) => {
  const config = {
    queryKey: paramInput,
    queryFn: getPurchasesReport,
    enabled: paramInput[1].enabled,
  };
  return useQuery(config);
};
