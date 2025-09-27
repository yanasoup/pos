'use client';
import type { QueryFunction } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { AxiosRequestConfig } from 'axios';

import { localAxios } from '@/lib/customAxiosLocal';
import { ShiftKasir } from '@/types/shift';

const pageSize = Number(process.env.NEXT_PUBLIC_BLOG_PAGE_SIZE);

type UseGetShiftsReturn = {
  success: boolean;
  message: string;
  data: {
    data: ShiftKasir[];
    total: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
};
export const getShifts: QueryFunction<
  UseGetShiftsReturn,
  UseGetShiftsParams
> = async ({ queryKey, signal }) => {
  // await wait(3000);
  const axiosRequestConfig: AxiosRequestConfig = {
    signal,
    params: {
      date_from: queryKey[1].date_from,
      date_to: queryKey[1].date_to,
      kasir: queryKey[1].kasir,
      status: queryKey[1].status,
      selisih: queryKey[1].selisih,
      page: queryKey[1].page,
      limit: queryKey[1].limit,
      queryString: queryKey[1].queryString,
    },
  };

  const response = await localAxios.get<UseGetShiftsReturn>(
    '/shift',
    axiosRequestConfig
  );
  return response.data;
};

export type UseGetShiftsParams = [
  string,
  {
    limit: number;
    page: number;
    queryString?: string;
    date_from?: string;
    date_to?: string;
    kasir?: string;
    status?: string;
    selisih?: string;
    isEnabled?: boolean;
  },
];

export const useGetShifts = ([
  qkey = 'shifts',
  {
    limit = pageSize,
    page = 1,
    queryString = '',
    date_from = '',
    date_to = '',
    kasir,
    status,
    selisih,
    isEnabled = true,
  },
]: UseGetShiftsParams) => {
  return useQuery({
    queryKey: [
      qkey,
      { limit, page, queryString, date_from, date_to, kasir, status, selisih },
    ],
    queryFn: getShifts,
    enabled: isEnabled,
  });
};

// ===================== get single row

type UseGetShiftReturn = {
  success: boolean;
  message: string;
  data: ShiftKasir;
};

export const getShift = async (params: UseGetShiftParams) => {
  const response = await localAxios.get<UseGetShiftReturn>(
    `/shift/${params.dataId}`
  );
  return response.data;
};

export const useGetShift = () => {
  return useMutation({
    mutationFn: (params: UseGetShiftParams) => getShift(params),
  });
};

type UseGetShiftParams = {
  dataId: string;
};

// ===================== get status shift kasir
export type UseGetShiftKasirStatusReturn = {
  status: string;
  balance: number;
};
export const getShiftKasir = async () => {
  const response =
    await localAxios.get<UseGetShiftKasirStatusReturn>(`/shift/kasir`);
  return response.data;
};

type UseGetShiftKasirParams = {
  date: string;
};

export const useGetShiftKasir = () => {
  return useMutation({
    mutationFn: () => getShiftKasir(),
  });
};
