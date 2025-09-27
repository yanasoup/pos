import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customAxios } from '@/lib/customAxios';

type SaleDetail = {
  product_id: string;
  product_code: string;
  qty: number;
  price: number;
};

export type CreateSaleParams = {
  data: {
    sale_master: {
      shift_id: string;
      sale_no: string;
      sale_date: string;
      customer?: string;
      notes?: string;
      invoice_discount?: number;
    };
    detail: SaleDetail[];
  };
  requestToken: string;
};
export const createTransaction = async (params: CreateSaleParams) => {
  // await wait(20000);
  const response = await customAxios.post<CreateSaleParams>(
    '/sales',
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

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();

  const mutationResult = useMutation({
    mutationFn: (params: CreateSaleParams) => createTransaction(params),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['sales'],
      });
    },
  });

  return mutationResult;
};
