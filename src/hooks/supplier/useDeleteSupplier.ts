import type { MutationFunction } from '@tanstack/query-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customAxios } from '@/lib/customAxios';
import { ProductCategory } from '@/types/product';

export type UseDeleteSupplierParams = {
  queryKey: [string, { limit: number; page: number }, string];
};

export type DeleteSupplierParams = {
  dataId: string | number;
  requestToken: string;
};

const deleteSupplier: MutationFunction<
  DeleteSupplierParams,
  DeleteSupplierParams
> = async (params: DeleteSupplierParams) => {
  const response = await customAxios.delete<DeleteSupplierParams>(
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
export const useDeleteSupplier = (
  invalidateQueryParams: UseDeleteSupplierParams
) => {
  const queryClient = useQueryClient();
  const mutationresult = useMutation({
    mutationFn: deleteSupplier,
    onMutate: async (params: DeleteSupplierParams) => {
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
              oldData.filter((data) => data.id !== params.dataId),
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
