import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryFunction } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

import { customAxios } from '@/lib/customAxios';

type MerchantResponse = {
  success: boolean;
  message: string;
  data: {
    name: string;
    description: string;
    updated_at: string;
  };
};
export type MerchantGetParams = [
  string,
  { enabled: boolean; requestToken: string },
];
const getMerchant: QueryFunction<MerchantResponse, MerchantGetParams> = async ({
  queryKey,
  signal,
}) => {
  const axiosRequestConfig: AxiosRequestConfig = {
    signal,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${queryKey[1].requestToken}`,
    },
  };

  const response = await customAxios.get<MerchantResponse>(
    `/merchant-profile`,
    axiosRequestConfig
  );
  return response.data;
};
export const useGetMerchantProfile = (queryKey: MerchantGetParams) => {
  return useQuery({
    queryKey: queryKey,
    queryFn: getMerchant,
    enabled: queryKey[1].enabled,
  });
};

export type UpdateMerchantParams = {
  data: {
    name: string;
    description: string;
  };
  requestToken: string;
};
const updateMerchant = async (params: UpdateMerchantParams) => {
  const response = await customAxios.post(
    `/merchant-profile/${params.requestToken}`,
    {
      name: params.data.name,
      description: params.data.description,
    },
    {
      headers: {
        'content-type': 'application/json',
        'X-HTTP-Method-Override': 'PUT',
        Authorization: `Bearer ${params.requestToken}`,
      },
    }
  );
  return response.data;
};

export const useUpdateMerchant = (invalidateQueryParams: MerchantGetParams) => {
  const queryClient = useQueryClient();
  const result = useMutation({
    mutationFn: (params: UpdateMerchantParams) => updateMerchant(params),
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: invalidateQueryParams,
      });
    },
  });

  return result;
};
