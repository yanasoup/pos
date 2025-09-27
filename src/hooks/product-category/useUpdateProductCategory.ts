import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customAxios } from '@/lib/customAxios';
import { wait } from '@/lib/utils';
import { ProductCategory } from '@/types/product';

export type UpdateProductCategoryParams = {
  id: string;
  data: {
    name: string;
    tenant_id: number;
    image: any;
  };
  requestToken: string;
};
async function updateProductCategory({
  id,
  data,
  requestToken,
}: UpdateProductCategoryParams): Promise<ProductCategory> {
  await wait(200);
  const response = await customAxios.post(`/product-categories/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
      // Accept: 'application/json',
      Authorization: `Bearer ${requestToken}`,
      'X-HTTP-Method-Override': 'PUT',
    },
  });
  return response.data;
}

export const useUpdateProductCategory = () => {
  const queryClient = useQueryClient();
  const mutationResult = useMutation({
    mutationFn: (params: UpdateProductCategoryParams) =>
      updateProductCategory(params),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ['product-categories'] }),
  });
  return mutationResult;
};
