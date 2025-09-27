import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customAxios } from '@/lib/customAxios';
import { Product } from '@/types/product';

import { UseGetProductsParams } from './useGetProduct';

export type UpdateProductParams = {
  id: string;
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
};
async function updateProduct({
  id,
  data,
  requestToken,
}: UpdateProductParams): Promise<Product> {
  // await wait(200);
  const response = await customAxios.post(`/products/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${requestToken}`,
      'X-HTTP-Method-Override': 'PUT',
    },
  });
  return response.data;
}

export const useUpdateProduct = (queryKey: UseGetProductsParams) => {
  const queryClient = useQueryClient();
  const mutationResult = useMutation({
    mutationFn: (params: UpdateProductParams) => updateProduct(params),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
  });
  return mutationResult;
};
