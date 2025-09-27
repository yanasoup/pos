'use client';
import type { QueryFunction } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

import { customAxios } from '@/lib/customAxios';
import { wait } from '@/lib/utils';
import { DBUser, User } from '@/types/user';

const pageSize = Number(process.env.NEXT_PUBLIC_BLOG_PAGE_SIZE);

type UseGetUsersReturn = {
  success: boolean;
  message: string;
  data: {
    data: DBUser[];
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
};
export const getUsers: QueryFunction<
  UseGetUsersReturn,
  UseGetUsersParams
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

  const response = await customAxios.get<UseGetUsersReturn>(
    '/users',
    axiosRequestConfig
  );
  return response.data;
};

type UseGetUsersParams = [
  string,
  {
    limit: number;
    page: number;
    queryString?: string;
  },
  string | undefined,
];

export const useGetUsers = ([
  qkey = 'users',
  { limit = pageSize, page = 1, queryString = '' },
  requestToken,
]: UseGetUsersParams) => {
  return useQuery({
    queryKey: [
      qkey,
      { limit: limit, page: page, queryString: queryString },
      requestToken,
    ],
    queryFn: getUsers,
  });
};

// ===================== get single row

export const getUser = async (params: UseGetUserParams) => {
  await wait(500);
  const response = await customAxios.get<User>(`/users/${params.dataId}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${params.requestToken}`,
    },
  });
  return response.data;
};

type UseGetUserParams = {
  dataId: string;
  requestToken: string;
};

export const useGetUser = () => {
  return useMutation({
    mutationFn: (params: UseGetUserParams) => getUser(params),
  });
};
