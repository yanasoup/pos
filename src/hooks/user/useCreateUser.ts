import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customAxios } from '@/lib/customAxios';
import { wait } from '@/lib/utils';

export type CreateUserParams = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role_id: String;
  requestToken: string;
};
export const createUser = async (params: CreateUserParams) => {
  await wait(200);
  const { requestToken, ...sendParams } = params;

  const response = await customAxios.post(
    '/users',
    { ...sendParams },
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

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  const mutationResult = useMutation({
    mutationFn: (params: CreateUserParams) => createUser(params),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['users'],
      });
    },
  });

  return mutationResult;
};
