import type { QueryFunction } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

import { customAxios } from '@/lib/customAxios';
import { wait } from '@/lib/utils';
import { SaleDetailreturn, SaleReportReturn } from '@/types/product';

type UseGetSalesReportReturn = {
  success: boolean;
  message: string;
  data: {
    data: SaleReportReturn[];
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
  aggregate?: {
    total_harga: number;
    total_margin: number;
  };
};

export const getSalesReport: QueryFunction<
  UseGetSalesReportReturn,
  UseGetSalesReportParams
> = async ({ queryKey, signal }) => {
  await wait(1000);
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
      product_code: queryKey[1]?.product_code,
    },
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${queryKey[1].requestToken}`,
    },
  };

  const response = await customAxios.get<UseGetSalesReportReturn>(
    `/sale-details`,
    axiosRequestConfig
  );
  return response.data;
};

export type UseGetSalesReportParams = [
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
  },
];

export const useGetSalesReport = (paramInput: UseGetSalesReportParams) => {
  const config = {
    queryKey: paramInput,
    queryFn: getSalesReport,
    enabled: paramInput[1].enabled,
  };
  return useQuery(config);
};

// ===================== get single record
type UseGetSaleReportParams = {
  dataId: number;
  requestToken: string;
};
type UseGetSaleReportReturn = {
  success: boolean;
  message: string;
  data: SaleDetailreturn[];
};

export const getSaleReport = async (params: UseGetSaleReportParams) => {
  // await wait(2000);
  const response = await customAxios.get<UseGetSaleReportReturn>(
    `/sale-details/${params.dataId}`,
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

export const useGetSaleReport = () => {
  return useMutation({
    mutationFn: (params: UseGetSaleReportParams) => getSaleReport(params),
  });
};
