import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customAxios } from '@/lib/customAxios';
import { wait } from '@/lib/utils';
import { SaleCartItem } from '@/redux/ui-slice';

import { UseGetPurchasesParams } from './useGetPurchase';

export type CreatePurchaseParams = {
  data: {
    master: {
      purchase_id?: string;
      tenant_id: number;
      purchase_no: string;
      purchase_date: string;
      supplier_id: string;
      notes?: string;
      isAutoPriceCheck: boolean;
      rate_harga_jual: number;
    };
    items: SaleCartItem[];
  };
  requestToken: string;
};

export const createPurchase = async (params: CreatePurchaseParams) => {
  await wait(200);
  const response = await customAxios.post<CreatePurchaseParams>(
    '/purchases',
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

export const useCreatePurchase = (queryKey: UseGetPurchasesParams) => {
  const queryClient = useQueryClient();

  const mutationResult = useMutation({
    mutationFn: (params: CreatePurchaseParams) => createPurchase(params),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKey,
      });
    },
  });

  return mutationResult;
};

export type CreateMasterPurchaseParams = {
  data: {
    tenant_id: number;
    purchase_no: string;
    purchase_date: Date;
    supplier_id: string;
    notes?: string;
  };
  requestToken: string;
};
export const createMasterPurchase = async (
  params: CreateMasterPurchaseParams
) => {
  await wait(200);
  const response = await customAxios.post<CreateMasterPurchaseParams>(
    '/purchases/save-master-purchase',
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
export const useCreateMasterPurchase = () => {
  const queryClient = useQueryClient();

  const mutationResult = useMutation({
    mutationFn: (params: CreateMasterPurchaseParams) =>
      createMasterPurchase(params),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['purchases'],
      });
    },
  });

  return mutationResult;
};
