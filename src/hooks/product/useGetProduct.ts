import type { QueryFunction } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

import { customAxios } from '@/lib/customAxios';
import { wait } from '@/lib/utils';
import { Product } from '@/types/product';

export type UseGetProductsReturn = {
  success: boolean;
  message: string;
  data: {
    data: Product[];
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
};
export const getProducts: QueryFunction<
  UseGetProductsReturn,
  UseGetProductsParams
> = async ({
  queryKey,
  signal,
}: {
  queryKey: UseGetProductsParams;
  signal: AbortSignal;
}) => {
  const axiosRequestConfig: AxiosRequestConfig = {
    signal,
    params: {
      page: queryKey[1].page,
      limit: queryKey[1].limit,
      queryString: queryKey[1].queryString,
      categoryId: queryKey[1].categoryId,
    },
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${queryKey[2]}`,
    },
  };

  const response = await customAxios.get<UseGetProductsReturn>(
    '/products',
    axiosRequestConfig
  );
  return response.data;
};

export type UseGetProductsParams = [
  string,
  {
    limit: number;
    page: number;
    queryString?: string;
    categoryId?: string;
    enabled?: boolean;
  },
  string | undefined,
];

export const useGetProducts = (params: UseGetProductsParams) => {
  return useQuery({
    queryKey: params,
    queryFn: getProducts,
    enabled: params[1].enabled,
  });
};

export const useGetProductsCustom = () => {
  return useMutation({
    mutationFn: async (queryKey: UseGetProductsParams) => {
      const response = await customAxios.get<UseGetProductsReturn>(
        `/products`,
        {
          params: {
            page: queryKey[1].page,
            limit: queryKey[1].limit,
            queryString: queryKey[1].queryString,
            categoryId: queryKey[1].categoryId,
          },
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${queryKey[2]}`,
          },
        }
      );
      return response.data;
    },
  });
};

// ===================== get single product
type UseGetProductParams = {
  dataId: string;
  requestToken: string;
};

export const getProduct = async (params: UseGetProductParams) => {
  await wait(300);
  const response = await customAxios.get<Product>(
    `/products/${params.dataId}`,
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

export const useGetProduct = () => {
  return useMutation({
    mutationFn: (params: UseGetProductParams) => getProduct(params),
  });
};

type UseGetProductByCodeParams = {
  productCode: string;
  requestToken: string;
};

export const getProductByCode = async (params: UseGetProductByCodeParams) => {
  // await wait(500);
  const response = await customAxios.get<Product>(`/products-code`, {
    params: {
      productCode: params.productCode,
    },
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${params.requestToken}`,
    },
  });
  return response.data;
};

export const useGetProductByCode = () => {
  return useMutation({
    mutationFn: (params: UseGetProductByCodeParams) => getProductByCode(params),
  });
};
