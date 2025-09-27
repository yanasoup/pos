import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customAxios } from '@/lib/customAxios';
import { wait } from '@/lib/utils';

import { UseGetProductsParams } from './useGetProduct';

export type CreateProductParams = {
  data: {
    product_code: string;
    name: string;
    description?: string;
    price: number;
    price_cogs: number;
    unit: string;
    category_id: string;
    tenant_id: number;
    image: any;
    minimum_stock: number;
  };
  requestToken: string;
  queryKey?: UseGetProductsParams;
};
export const createProduct = async (params: CreateProductParams) => {
  await wait(200);
  const response = await customAxios.post<CreateProductParams>(
    '/products',
    params.data,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        Authorization: `Bearer ${params.requestToken}`,
      },
    }
  );
  return response.data;
};

export const useCreateProduct = (queryKey?: any) => {
  const queryClient = useQueryClient();

  const mutationResult = useMutation({
    mutationFn: (params: CreateProductParams) => createProduct(params),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKey || ['product-inventories'],
      });
    },
  });

  return mutationResult;
};
