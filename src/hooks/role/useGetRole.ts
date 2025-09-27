'use client';
import type { QueryFunction } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

import { customAxios } from '@/lib/customAxios';
import { wait } from '@/lib/utils';
import { Role } from '@/types/role';
const pageSize = Number(process.env.NEXT_PUBLIC_BLOG_PAGE_SIZE);

type UseGetRolesReturn = {
  success: boolean;
  message: string;
  data: {
    data: Role[];
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
};
export const getRoles: QueryFunction<
  UseGetRolesReturn,
  UseGetRolesParams
> = async ({ queryKey, signal }) => {
  await wait(300);
  const axiosRequestConfig: AxiosRequestConfig = {
    signal,
    params: {
      page: queryKey[1].page,
      limit: queryKey[1].limit,
      queryString: queryKey[1].queryString,
    },
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${queryKey[2]}`,
    },
  };

  const response = await customAxios.get<UseGetRolesReturn>(
    '/roles',
    axiosRequestConfig
  );
  return response.data;
};

type UseGetRolesParams = [
  string,
  {
    limit: number;
    page: number;
    queryString?: string;
  },
  string | undefined,
];

export const useGetRoles = ([
  qkey = 'roles',
  { limit = pageSize, page = 1, queryString = '' },
  requestToken,
]: UseGetRolesParams) => {
  return useQuery({
    queryKey: [
      qkey,
      { limit: limit, page: page, queryString: queryString },
      requestToken,
    ],
    queryFn: getRoles,
  });
};

// ===================== get single product category

export const getRole = async (params: UseGetRoleParams) => {
  await wait(500);
  const response = await customAxios.get<Role>(`/roles/${params.dataId}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${params.requestToken}`,
    },
  });
  return response.data;
};

type UseGetRoleParams = {
  dataId: string;
  requestToken: string;
};

export const useGetRole = () => {
  return useMutation({
    mutationFn: (params: UseGetRoleParams) => getRole(params),
  });
};
