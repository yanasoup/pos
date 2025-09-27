import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customAxios } from '@/lib/customAxios';
import { wait } from '@/lib/utils';
import { Role } from '@/types/role';

export type UpdateRoleParams = {
  id: string;
  data: {
    role_name: string;
    tenant_id: number;
    granted_menus: string[];
  };
  requestToken: string;
};
async function updateRole({
  id,
  data,
  requestToken,
}: UpdateRoleParams): Promise<Role> {
  await wait(200);
  const response = await customAxios.post(`/roles/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
      // Accept: 'application/json',
      Authorization: `Bearer ${requestToken}`,
      'X-HTTP-Method-Override': 'PUT',
    },
  });
  return response.data;
}

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  const mutationResult = useMutation({
    mutationFn: (params: UpdateRoleParams) => updateRole(params),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['roles'] }),
  });
  return mutationResult;
};
