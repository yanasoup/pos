import type { MutationFunction } from '@tanstack/query-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customAxios } from '@/lib/customAxios';
import { wait } from '@/lib/utils';

export type CreateRoleParams = {
  role_name: string;
  requestToken: string;
  granted_menus: string[];
};
export const createRole = async (params: CreateRoleParams) => {
  await wait(200);
  const response = await customAxios.post(
    '/roles',
    { role_name: params.role_name, granted_menus: params.granted_menus },
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        Authorization: `Bearer ${params.requestToken}`,
      },
    }
  );
  return response.data;
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();

  const mutationResult = useMutation({
    mutationFn: (params: CreateRoleParams) => createRole(params),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['roles'],
      });
    },
  });

  return mutationResult;
};
