import { useMutation, useQueryClient } from '@tanstack/react-query';

import { localAxios } from '@/lib/customAxiosLocal';

import { ShiftKasir } from '@/types/shift';

export type UpdateShiftParams = {
  id: string;
  balance: number;
};
async function updateShift({
  id,
  balance,
}: UpdateShiftParams): Promise<ShiftKasir> {
  const response = await localAxios.post(`/shifts/${id}`, {
    params: {
      balance,
    },
    headers: {
      'Content-Type': 'multipart/form-data',
      'X-HTTP-Method-Override': 'PUT',
    },
  });
  return response.data;
}

export const useUpdateShift = () => {
  const queryClient = useQueryClient();
  const mutationResult = useMutation({
    mutationFn: (params: UpdateShiftParams) => updateShift(params),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['shifts'] }),
  });
  return mutationResult;
};
