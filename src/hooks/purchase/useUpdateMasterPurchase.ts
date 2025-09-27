import { useQueryClient, useMutation } from '@tanstack/react-query';

import { customAxios } from '@/lib/customAxios';
import { wait } from '@/lib/utils';

import { CreatePurchaseParams } from './useCreateMasterPurchase';
import { UseGetPurchasesParams } from './useGetPurchase';
export type UpdateMasterPurchaseParams = {
  id: string;
  data: {
    purchase_no: string;
    purchase_date: Date;
    supplier_id: string;
    notes?: string;
  };
  requestToken: string;
};
const updateMasterPurchase = async ({
  id,
  data,
  requestToken,
}: UpdateMasterPurchaseParams) => {
  const response = await customAxios.post(`/purchases/${id}`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${requestToken}`,
      'X-HTTP-Method-Override': 'PUT',
    },
  });

  return response.data;
};
export type UseUpdateMasterPurchaseParams = {
  qKey: [
    string,
    { page: number; limit: number; queryString: string; supplierId: string },
  ];
};

export const useUpdateMasterPurchase = (qKey: UseGetPurchasesParams) => {
  const queryClient = useQueryClient();
  const mutationResult = useMutation({
    mutationFn: (params: UpdateMasterPurchaseParams) =>
      updateMasterPurchase(params),
    onSettled: () => queryClient.invalidateQueries({ queryKey: qKey }),
  });

  return mutationResult;
};

export const updatePurchase = async (params: CreatePurchaseParams) => {
  await wait(200);
  const response = await customAxios.put<CreatePurchaseParams>(
    `/purchases/${params.data.master.purchase_id}`,
    params.data,
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

export const useUpdatePurchase = (queryKey: UseGetPurchasesParams) => {
  const queryClient = useQueryClient();

  const mutationResult = useMutation({
    mutationFn: (params: CreatePurchaseParams) => updatePurchase(params),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKey,
      });
    },
  });

  return mutationResult;
};
