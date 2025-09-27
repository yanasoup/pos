import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customAxios } from '@/lib/customAxios';
import { wait } from '@/lib/utils';
import { User } from '@/types/user';

export type UpdateUserParams = {
  id: string;
  data: {
    name: string;
    email: string;
    password?: string;
    password_confirmation?: string;
    role_id: String;
  };
  requestToken: string;
};

async function updateUser({
  id,
  data,
  requestToken,
}: UpdateUserParams): Promise<User> {
  await wait(200);
  const response = await customAxios.post(`/users/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data',
      // Accept: 'application/json',
      Authorization: `Bearer ${requestToken}`,
      'X-HTTP-Method-Override': 'PUT',
    },
  });
  return response.data;
}

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  const mutationResult = useMutation({
    mutationFn: (params: UpdateUserParams) => updateUser(params),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
  return mutationResult;
};
