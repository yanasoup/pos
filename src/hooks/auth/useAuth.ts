import https from 'https';

import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';

import { customAxios } from '@/lib/customAxios';
import type { AuthUser } from '@/redux/ui-slice';

const agent = new https.Agent({
  rejectUnauthorized: false,
});
const agentSecure = new https.Agent({
  rejectUnauthorized: false,
});

export const authAxios = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  withCredentials: true,
  // withXSRFToken: true,
  headers: {
    'Content-Type': 'application/json',
  },
  httpAgent: agent,
  httpsAgent: agentSecure,
});

async function getUser(email: string): Promise<AuthUser> {
  const response = await customAxios.get(`/users/${email}`);
  return response.data;
}

export const useGetUser = (email: string) => {
  return useQuery({
    queryKey: ['auth-user'],
    queryFn: () => getUser(email),
    enabled: !!email,
  });
};

type LoginParams = {
  email: string;
  password: string;
};
type LoginResponse = {
  user: {
    id: number;
    name: string;
    email: string;
    tenant_id: number;
  };
  token: string;
};

export const useAppLogin = () => {
  return useMutation({
    mutationFn: (params: LoginParams) => appLogin(params),
  });
};

export const appLogin = async ({ email, password }: LoginParams) => {
  const response = await customAxios.post<LoginResponse>(
    '/login',
    { email, password },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
    }
  );

  return response.data;
};

export type useUpdatePasswordParams = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  authToken: string;
};
export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: (params: useUpdatePasswordParams) => updatePassword(params),
  });
};

export const updatePassword = async ({
  currentPassword,
  newPassword,
  confirmPassword,
  authToken,
}: useUpdatePasswordParams) => {
  const response = await customAxios.patch<LoginResponse>(
    '/users/password',
    { currentPassword, newPassword, confirmPassword },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
        Authorization: `Bearer ${authToken}`,
      },
    }
  );
  return response.data;
};

export type UpdateProfileParams = {
  name: string;
  headline: string;
  avatar: any;
  authToken: string;
};
export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: (params: UpdateProfileParams) => updateProfile(params),
  });
};

export const updateProfile = async (params: UpdateProfileParams) => {
  const apiParams = {
    name: params.name,
    headline: params.headline,
    avatar: params.avatar,
  };
  const response = await customAxios.patch('/users/profile', apiParams, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Accept: '*/*',
      Authorization: `Bearer ${params.authToken}`,
    },
  });

  return response.data;
};
