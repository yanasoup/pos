import type { MutationFunction } from '@tanstack/query-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customAxios } from '@/lib/customAxios';
import { wait } from '@/lib/utils';

export type CreateProductCategoryParams = {
  name: string;
  tenant_id: number;
  requestToken: string;
  image: any;
};
export const createProductCategory = async (
  params: CreateProductCategoryParams
) => {
  await wait(200);
  const response = await customAxios.post<CreateProductCategoryParams>(
    '/product-categories',
    { name: params.name, tenant_id: params.tenant_id, image: params.image },
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

export const useCreateProductCategory = () => {
  const queryClient = useQueryClient();

  const mutationResult = useMutation({
    mutationFn: (params: CreateProductCategoryParams) =>
      createProductCategory(params),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['product-categories'],
      });
    },
  });

  return mutationResult;
};
