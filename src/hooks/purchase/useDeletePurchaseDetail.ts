import type { MutationFunction } from '@tanstack/query-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customAxios } from '@/lib/customAxios';

import { UseGetPurchaseDetailsParams } from './useGetPurchaseDetail';

export type DeletePurchaseDetailParams = {
  dataId: string | number;
  requestToken: string;
};

export const useDeletePurchaseDetail = (
  invalidateQueryParams: UseGetPurchaseDetailsParams
) => {
  const queryClient = useQueryClient();
  const mutationresult = useMutation({
    mutationFn: deletePurchaseDetail,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invalidateQueryParams,
      });
    },
  });

  return mutationresult;
};

const deletePurchaseDetail: MutationFunction<
  DeletePurchaseDetailParams,
  DeletePurchaseDetailParams
> = async (params: DeletePurchaseDetailParams) => {
  const response = await customAxios.delete<DeletePurchaseDetailParams>(
    `/purchase-details/${params.dataId}`,
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
