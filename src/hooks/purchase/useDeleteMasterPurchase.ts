import type { MutationFunction } from '@tanstack/query-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customAxios } from '@/lib/customAxios';

import { UseGetPurchasesParams, UseGetPurchasesReturn } from './useGetPurchase';

export type UseDeleteMasterPurchaseParams = {
  queryKey: [string, { limit: number; page: number }, string];
};

export type DeleteMasterPurchaseParams = {
  dataId: string | number;
  requestToken: string;
};

const deleteMasterPurchase: MutationFunction<
  DeleteMasterPurchaseParams,
  DeleteMasterPurchaseParams
> = async (params: DeleteMasterPurchaseParams) => {
  const response = await customAxios.delete<DeleteMasterPurchaseParams>(
    `/purchases/${params.dataId}`,
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
export const useDeleteMasterPurchase = (
  invalidateQueryParams: UseGetPurchasesParams
) => {
  const queryClient = useQueryClient();
  const mutationresult = useMutation({
    mutationFn: deleteMasterPurchase,
    onMutate: async (params: DeleteMasterPurchaseParams) => {
      await queryClient.cancelQueries({
        queryKey: invalidateQueryParams,
      });

      const previousData = queryClient.getQueryData(invalidateQueryParams);

      queryClient.setQueryData(
        invalidateQueryParams,
        (oldData: UseGetPurchasesReturn) => {
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
