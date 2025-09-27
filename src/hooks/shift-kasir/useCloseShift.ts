import { useMutation, useQueryClient } from '@tanstack/react-query';

import { localAxios } from '@/lib/customAxiosLocal';
import { ShiftKasir } from '@/types/shift';

export type CloseShiftParams = {
  shift_id: string;
  balance: number;
  closing_status: 'closed' | 'pending_close';
};
async function closeShift(params: CloseShiftParams): Promise<ShiftKasir> {
  const response = await localAxios.post(
    `/shift/kasir`,
    {
      shift_id: params.shift_id,
      balance: params.balance,
      closing_status: params.closing_status,
    },
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
}

export const useCloseShift = () => {
  const queryClient = useQueryClient();
  const mutationResult = useMutation({
    mutationFn: (params: CloseShiftParams) => closeShift(params),
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['shifts'] }),
  });
  return mutationResult;
};
