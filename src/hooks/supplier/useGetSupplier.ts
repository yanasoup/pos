'use client';
import type { QueryFunction } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

import { customAxios } from '@/lib/customAxios';
import { wait } from '@/lib/utils';
import type { Supplier } from '@/types/supplier';
const pageSize = Number(process.env.NEXT_PUBLIC_BLOG_PAGE_SIZE);

type UseGetSuppliersReturn = {
  success: boolean;
  message: string;
  data: {
    data: Supplier[];
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
};

type UseGetSuppliersParams = [
  string,
  {
    limit: number;
    page: number;
    queryString?: string;
  },
  string | undefined,
];

export const getSuppliers: QueryFunction<
  UseGetSuppliersReturn,
  UseGetSuppliersParams
> = async ({ queryKey, signal }) => {
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

  const response = await customAxios.get<UseGetSuppliersReturn>(
    '/suppliers',
    axiosRequestConfig
  );
  return response.data;
};

export const useGetSuppliers = ([
  qkey = 'suppliers',
  { limit = pageSize, page = 1, queryString = '' },
  requestToken,
]: UseGetSuppliersParams) => {
  return useQuery({
    queryKey: [
      qkey,
      { limit: limit, page: page, queryString: queryString },
      requestToken,
    ],
    queryFn: getSuppliers,
  });
};

// ===================== get single product category

export const getSupplier = async (params: UseGetSupplierParams) => {
  await wait(500);
  const response = await customAxios.get<Supplier>(
    `/suppliers/${params.dataId}`,
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

type UseGetSupplierParams = {
  dataId: string;
  requestToken: string;
};

export const useGetSupplier = () => {
  return useMutation({
    mutationFn: (params: UseGetSupplierParams) => getSupplier(params),
  });
};
