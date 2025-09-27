'use client';
import { format, getUnixTime } from 'date-fns';
import { id } from 'date-fns/locale';
import { RefreshCcw } from 'lucide-react';
import React from 'react';
import { useSelector } from 'react-redux';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  useGetSummary,
  UseGetSummaryParams,
} from '@/hooks/summary/useGetSummary';
import { cn, formatNumber } from '@/lib/utils';
import { RootState } from '@/redux/store';

const LastSale = ({ className }: { className?: string }) => {
  const [goRefreshData, setGoRefreshData] = React.useState(false);
  const uiuxState = useSelector((state: RootState) => state.uiux);
  const [requestTime, setRequestTime] = React.useState('');
  const queryKey: UseGetSummaryParams = [
    'summary',
    {
      enabled: goRefreshData,
      tipe: 'last_sale',
      requestToken: uiuxState.apiToken!,
    },
    requestTime,
  ];
  const { data: summaryData, isLoading } = useGetSummary(queryKey);

  const handleRefreshData = () => {
    const dateNow = new Date();
    setGoRefreshData(false);
    setRequestTime(getUnixTime(dateNow).toString());
    setGoRefreshData(true);
  };

  React.useEffect(() => {
    const dateNow = new Date();
    setRequestTime(getUnixTime(dateNow).toString());

    setGoRefreshData(true);
  }, []);

  return (
    <>
      <Card className={cn('flex-1 rounded-xl bg-white p-4', className)}>
        <CardHeader className='p-0'>
          <CardTitle className='text-lg font-semibold'>
            Transaksi Penjualan Terakhir
          </CardTitle>
          <CardDescription className='text-xs text-neutral-700'>
            {summaryData?.dataLastSale?.[0]?.sale_date
              ? `Pada : ${format(summaryData.dataLastSale?.[0]?.sale_date, 'dd MMM yyyy', { locale: id })}`
              : ''}
          </CardDescription>

          <CardAction>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleRefreshData}
                  variant='ghost'
                  className={cn('')}
                  disabled={isLoading}
                >
                  <RefreshCcw
                    className={cn('size-5', isLoading ? 'animate-spin' : '')}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent side='top'>Muat Ulang</TooltipContent>
            </Tooltip>
          </CardAction>
        </CardHeader>
        <CardContent className='p-0'>
          {(summaryData?.dataLastSale?.length || 0) === 0 && (
            <p className='text-xs text-neutral-700 lg:text-sm'>
              Tidak Ada Data
            </p>
          )}
          {(summaryData?.dataLastSale?.length || 0) > 0 && (
            <table className='w-full border-collapse overflow-auto'>
              <thead>
                <tr className='border-b border-neutral-300'>
                  <th className='font-regular text-xs-semibold lg:text-sm-semibold sticky top-0 p-2 text-left text-neutral-900'>
                    Item
                  </th>
                  <th className='font-regular text-xs-semibold lg:text-sm-semibold sticky top-0 p-2 text-center text-neutral-900'>
                    Qty
                  </th>
                  <th className='font-regular text-xs-semibold lg:text-sm-semibold sticky top-0 p-2 text-right text-neutral-900'>
                    Harga
                  </th>
                  <th className='font-regular text-xs-semibold lg:text-sm-semibold sticky top-0 p-2 text-right text-neutral-900'>
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className='[&>tr:nth-child(even)]:bg-neutral-25 [&>tr:nth-child(odd)]:bg-neutral-50'>
                {summaryData?.dataLastSale?.map((item, i) => (
                  <tr key={i} className='border-b border-neutral-300'>
                    <td className='border-neutral-400 px-2 py-1 text-left text-xs text-neutral-800 lg:text-sm'>
                      {item.product_name}
                    </td>
                    <td className='border-neutral-400 px-2 py-1 text-center text-xs text-neutral-800 lg:text-sm'>
                      {formatNumber(item.qty)}
                    </td>
                    <td className='border-neutral-400 px-2 py-1 text-right text-xs text-neutral-800 lg:text-sm'>
                      {formatNumber(item.price)}
                    </td>
                    <td className='border-neutral-400 px-2 py-1 text-right text-xs text-neutral-800 lg:text-sm'>
                      {formatNumber(item.qty * item.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default LastSale;
