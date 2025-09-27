'use client';
import type { QueryFunction } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

import { customAxios } from '@/lib/customAxios';
import { wait } from '@/lib/utils';
import { ProductCategory } from '@/types/product';
const pageSize = Number(process.env.NEXT_PUBLIC_BLOG_PAGE_SIZE);

type UseGetProductCategoriesReturn = {
  success: boolean;
  message: string;
  data: {
    data: ProductCategory[];
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
};
export const getProductCategories: QueryFunction<
  UseGetProductCategoriesReturn,
  UseGetProductCategoriesParams
> = async ({ queryKey, signal }) => {
  await wait(300);
  const axiosRequestConfig: AxiosRequestConfig = {
    signal,
    params: {
      page: queryKey[1].page,
      limit: queryKey[1].limit,
      queryString: queryKey[1].queryString,
    },
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${queryKey[2]}`,
    },
  };

  const response = await customAxios.get<UseGetProductCategoriesReturn>(
    '/product-categories',
    axiosRequestConfig
  );
  return response.data;
};

type UseGetProductCategoriesParams = [
  string,
  {
    limit: number;
    page: number;
    queryString?: string;
  },
  string | undefined,
];

export const useGetProductCategories = ([
  qkey = 'product-categories',
  { limit = pageSize, page = 1, queryString = '' },
  requestToken,
]: UseGetProductCategoriesParams) => {
  return useQuery({
    queryKey: [
      qkey,
      { limit: limit, page: page, queryString: queryString },
      requestToken,
    ],
    queryFn: getProductCategories,
  });
};

// ===================== get single product category

export const getProductCategory = async (
  params: UseGetProductCategoryParams
) => {
  await wait(500);
  const response = await customAxios.get<ProductCategory>(
    `/product-categories/${params.categoryId}`,
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

type UseGetProductCategoryParams = {
  categoryId: string;
  requestToken: string;
};

export const useGetProductCategory = () => {
  return useMutation({
    mutationFn: (params: UseGetProductCategoryParams) =>
      getProductCategory(params),
  });
};
