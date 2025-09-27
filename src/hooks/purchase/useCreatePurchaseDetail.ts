import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customAxios } from '@/lib/customAxios';
import { wait } from '@/lib/utils';

import { UseGetPurchaseDetailsParams } from './useGetPurchaseDetail';

export type CreatePurchaseDetailParams = {
  data: {
    isAutoPriceCheck: boolean;
    master_id: number | string;
    product_id: string | number;
    product_code: string;
    qty: number;
    price: number;
    rate_harga_jual: number | null;
  };
  requestToken: string;
};
export const createPurchaseDetail = async (
  params: CreatePurchaseDetailParams
) => {
  await wait(200);
  const response = await customAxios.post<CreatePurchaseDetailParams>(
    '/purchase-details',
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

type PurchaseDetailsData = {
  data: {
    created_at: string;
    created_by: number;
    id: string;
    notes: string;
    pd_id: string;
    price: number;
    product_code: string;
    product_id: string;
    product_name: string;
    purchase_date: string;
    purchase_no: string;
    qty: number;
    supplier: string;
    supplier_id: string;
    tenant_id: number;
    updated_at: string;
    updated_by: number;
  }[];
  message: string;
  success: boolean;
  param: string[];
};
export const useCreatePurchaseDetail = (
  invalidateQueryParams: UseGetPurchaseDetailsParams
) => {
  const queryClient = useQueryClient();

  const mutationResult = useMutation({
    mutationFn: (params: CreatePurchaseDetailParams) =>
      createPurchaseDetail(params),
    onMutate: async (params: CreatePurchaseDetailParams) => {
      await queryClient.cancelQueries({
        queryKey: invalidateQueryParams,
      });
      const previousData: PurchaseDetailsData | undefined =
        queryClient.getQueryData(invalidateQueryParams);

      const newRecord = {
        created_at: previousData?.data[0].created_at || '',
        id: previousData?.data[0].id,
        notes: previousData?.data[0].notes || '',
        pd_id: previousData?.data[0].pd_id || '',
        price: params?.data.price || 0,
        product_code: params?.data.product_code || '',
        product_id: params?.data.product_id || '',
        product_name: previousData?.data[0].product_name || '',
        purchase_date: previousData?.data[0].purchase_date || '',
        purchase_no: previousData?.data[0].purchase_no || '',
        qty: params?.data.qty || 0,
        supplier: previousData?.data[0].supplier || '',
        supplier_id: previousData?.data[0].supplier_id || '',
        tenant_id: previousData?.data[0].tenant_id || 0,
        updated_at: previousData?.data[0].updated_at || '',
        updated_by: previousData?.data[0].updated_by || 0,
        created_by: previousData?.data[0].created_by || 0,
        // ...params.data
      };

      queryClient.setQueryData(invalidateQueryParams, (oldData: any) => {
        if (oldData) {
          const newData = {
            ...oldData,
            data: [newRecord, ...oldData.data],
          };
          return newData;
        }
        return {
          data: [newRecord],
          message: 'Ok',
          params: [],
          success: true,
        };
      });
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

  return mutationResult;
};
