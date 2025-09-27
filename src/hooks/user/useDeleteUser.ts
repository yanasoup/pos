import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customAxios } from '@/lib/customAxios';
import { User } from '@/types/user';

export type UseDeleteUserParams = {
  queryKey: [string, { limit: number; page: number }, string];
};

export type DeleteUserParams = {
  dataId: string | number;
  requestToken: string;
};

const deleteRole = async (params: DeleteUserParams) => {
  const response = await customAxios.delete<DeleteUserParams>(
    `/users/${params.dataId}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${params.requestToken}`,
      },
    }
  );

  return response.data;
};
export const useDeleteUser = (invalidateQueryParams: UseDeleteUserParams) => {
  const queryClient = useQueryClient();
  const mutationresult = useMutation({
    mutationFn: deleteRole,
    onMutate: async (params: DeleteUserParams) => {
      await queryClient.cancelQueries({
        queryKey: invalidateQueryParams.queryKey,
      });

      const previousData = queryClient.getQueryData(
        invalidateQueryParams.queryKey
      );

      queryClient.setQueryData(
        invalidateQueryParams.queryKey,
        (oldData: User[]) => {
          if (oldData) {
            const newData = [
              oldData.filter((category) => category.id !== params.dataId),
            ];

            return newData;
          }
          return [];
        }
      );
      return { previousData, queryKey: invalidateQueryParams.queryKey };
    },
    onError: (error, newData, context) => {
      if (context) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      } else {
        console.log(error, newData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: invalidateQueryParams.queryKey,
      });
    },
  });

  return mutationresult;
};
