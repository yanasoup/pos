import { useMutation, useQueryClient } from '@tanstack/react-query';

import { localAxios } from '@/lib/customAxiosLocal';

export type CreateShiftParams = {
  balance: number;
};
export const createShift = async (params: CreateShiftParams) => {
  const response = await localAxios.post(
    '/shift',
    {
      balance: params.balance,
    },
    {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
      },
    }
  );
  return response.data;
};

export const useCreateShift = () => {
  const queryClient = useQueryClient();

  const mutationResult = useMutation({
    mutationFn: (params: CreateShiftParams) => createShift(params),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['shifts'],
      });
    },
  });

  return mutationResult;
};
