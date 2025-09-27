import { useMutation, useQueryClient } from '@tanstack/react-query';

import { customAxios } from '@/lib/customAxios';
import { Role } from '@/types/role';

export type UseDeleteRoleParams = {
  queryKey: [string, { limit: number; page: number }, string];
};

export type DeleteRoleParams = {
  dataId: string | number;
  requestToken: string;
};

const deleteRole = async (params: DeleteRoleParams) => {
  const response = await customAxios.delete<DeleteRoleParams>(
    `/roles/${params.dataId}`,
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
export const useDeleteRole = (invalidateQueryParams: UseDeleteRoleParams) => {
  const queryClient = useQueryClient();
  const mutationresult = useMutation({
    mutationFn: deleteRole,
    onMutate: async (params: DeleteRoleParams) => {
      await queryClient.cancelQueries({
        queryKey: invalidateQueryParams.queryKey,
      });

      const previousData = queryClient.getQueryData(
        invalidateQueryParams.queryKey
      );

      queryClient.setQueryData(
        invalidateQueryParams.queryKey,
        (oldData: Role[]) => {
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
