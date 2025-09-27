import type { MutationFunction } from '@tanstack/query-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customAxios } from '@/lib/customAxios';

import { UseGetProductsParams, UseGetProductsReturn } from './useGetProduct';

export type UseDeleteProductParams = {
  queryKey: [string, { limit: number; page: number }, string];
};

export type DeleteProductParams = {
  dataId: string | number;
  requestToken: string;
};

const deleteProduct: MutationFunction<
  DeleteProductParams,
  DeleteProductParams
> = async (params: DeleteProductParams) => {
  const response = await customAxios.delete<DeleteProductParams>(
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
export const useDeleteProduct = (
  invalidateQueryParams: UseGetProductsParams
) => {
  const queryClient = useQueryClient();
  const mutationresult = useMutation({
    mutationFn: deleteProduct,
    onMutate: async (params: DeleteProductParams) => {
      await queryClient.cancelQueries({
        queryKey: invalidateQueryParams,
      });

      const previousData = queryClient.getQueryData(invalidateQueryParams);
      queryClient.setQueryData(
        invalidateQueryParams,
        (oldData: UseGetProductsReturn) => {
          if (oldData) {
            const newData = {
              ...oldData,
              data: {
                ...oldData.data,
                data: oldData.data.data.filter(
                  (old) => old.id !== params.dataId
                ),
              },
            };
            return newData;
          }
          return [];
        }
      );

      return { previousData, queryKey: invalidateQueryParams };
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
        queryKey: invalidateQueryParams,
      });
    },
  });

  return mutationresult;
};
