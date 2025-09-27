import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customAxios } from '@/lib/customAxios';

import { UseGetPurchaseDetailsParams } from './useGetPurchaseDetail';

export type UpdatePurchaseDetailParams = {
  isAutoPriceCheck: boolean;
  purchase_detail_id: string;
  qty: number;
  price: number;
  old_qty: number;
  old_price: number;
  requestToken: string;
  rate_harga_jual: number | null;
};
const updatePurchaseDetail = async (data: UpdatePurchaseDetailParams) => {
  const response = await customAxios.put(
    `/purchase-details/${data.purchase_detail_id}`,
    data,
    {
      headers: {
        'content-type': 'application/json',
        Authorization: `Bearer ${data.requestToken}`,
      },
    }
  );
  return response.data;
};

const useUpdatePurchaseDetail = (
  invalidateQueryParams: UseGetPurchaseDetailsParams
) => {
  const queryClient = useQueryClient();
  const result = useMutation({
    mutationFn: updatePurchaseDetail,
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: invalidateQueryParams,
      });
    },
  });

  return result;
};

export default useUpdatePurchaseDetail;
