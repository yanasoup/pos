import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customAxios } from '@/lib/customAxios';
import { wait } from '@/lib/utils';

export type CreateSupplierParams = {
  name: string;
  tenant_id: number;
  address?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  requestToken: string;
};
export const createSupplier = async (params: CreateSupplierParams) => {
  await wait(200);
  const { requestToken, ...newParams } = params;

  const response = await customAxios.post<CreateSupplierParams>(
    '/suppliers',
    { ...newParams },
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        Authorization: `Bearer ${requestToken}`,
      },
    }
  );
  return response.data;
};

export const useCreateSupplier = () => {
  const queryClient = useQueryClient();

  const mutationResult = useMutation({
    mutationFn: (params: CreateSupplierParams) => createSupplier(params),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['suppliers'],
      });
    },
  });

  return mutationResult;
};
