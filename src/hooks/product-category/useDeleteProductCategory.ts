import type { MutationFunction } from '@tanstack/query-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customAxios } from '@/lib/customAxios';
import { ProductCategory } from '@/types/product';

export type UseDeleteProductCategoryParams = {
  queryKey: [string, { limit: number; page: number }, string];
};

export type DeleteProductCategoryParams = {
  categoryId: string | number;
  requestToken: string;
};

const deleteProductCategory: MutationFunction<
  DeleteProductCategoryParams,
  DeleteProductCategoryParams
> = async (params: DeleteProductCategoryParams) => {
  const response = await customAxios.delete<DeleteProductCategoryParams>(
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
export const useDeleteProductCategory = (
  invalidateQueryParams: UseDeleteProductCategoryParams
) => {
  const queryClient = useQueryClient();
  const mutationresult = useMutation({
    mutationFn: deleteProductCategory,
    onMutate: async (params: DeleteProductCategoryParams) => {
      await queryClient.cancelQueries({
        queryKey: invalidateQueryParams.queryKey,
      });

      const previousData = queryClient.getQueryData(
        invalidateQueryParams.queryKey
      );

      queryClient.setQueryData(
        invalidateQueryParams.queryKey,
        (oldData: ProductCategory[]) => {
          if (oldData) {
            const newData = [
              oldData.filter((category) => category.id !== params.categoryId),
            ];

            return newData;
          }
          return [];
        }
      );
      return { previousData, queryKey: invalidateQueryParams.queryKey };
    },
    onError: (error, newData, context) => {
      if (context) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      } else {
        console.log(error, newData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: invalidateQueryParams.queryKey,
      });
    },
  });

  return mutationresult;
};
