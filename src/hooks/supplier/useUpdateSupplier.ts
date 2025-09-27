import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customAxios } from '@/lib/customAxios';
import { wait } from '@/lib/utils';
import { Supplier } from '@/types/supplier';

export type UpdateSupplierParams = {
  id: string;
  data: {
    name: string;
    tenant_id: number;
    address?: string;
    contact_person?: string;
    phone?: string;
    email?: string;
  };
  requestToken: string;
};
async function updateSupplier({
  id,
  data,
  requestToken,
}: UpdateSupplierParams): Promise<Supplier> {
  await wait(200);
  const response = await customAxios.post(`/suppliers/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${requestToken}`,
      'X-HTTP-Method-Override': 'PUT',
    },
  });
  return response.data;
}

export const useUpdateSupplier = () => {
  const queryClient = useQueryClient();
  const mutationResult = useMutation({
    mutationFn: (params: UpdateSupplierParams) => updateSupplier(params),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['suppliers'] }),
  });
  return mutationResult;
};
