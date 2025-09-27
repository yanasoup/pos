import { QueryFunction, useQuery } from '@tanstack/react-query';

import { customAxios } from '@/lib/customAxios';
import { StockAPIReturn } from '@/types/product';

export type UseGetStockParams = [
  string,
  {
    limit: number;
    page: number;
    queryString?: string;
    categoryId?: string;
    enabled?: boolean;
  },
  string,
];

const getStocks: QueryFunction<StockAPIReturn, UseGetStockParams> = async ({
  queryKey,
  signal,
}) => {
  const response = await customAxios.get<StockAPIReturn>('/stocks', {
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
  });

  return response.data;
};
export const useGetStock = (params: UseGetStockParams) => {
  const { data, isLoading, error } = useQuery({
    queryKey: params,
    queryFn: getStocks,
    enabled: params[1].enabled,
  });

  return { data, isLoading, error };
};
