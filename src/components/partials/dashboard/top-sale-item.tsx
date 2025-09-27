'use client';
import { format, getUnixTime, subDays } from 'date-fns';
import { id } from 'date-fns/locale';
import { RefreshCcw } from 'lucide-react';
import React, { useState } from 'react';
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
import { cn } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { getTopItemsColumn } from './columns-topSaleItems';
import { DataTable } from '@/components/data-table';

const DEFAULT_PAGE_SIZE = Number(process.env.NEXT_PUBLIC_BASE_URL);
const TopSaleItem = ({ className }: { className?: string }) => {
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [goRefreshData, setGoRefreshData] = React.useState(false);
  const uiuxState = useSelector((state: RootState) => state.uiux);
  const [requestTime, setRequestTime] = React.useState('');
  const queryKey: UseGetSummaryParams = [
    'summary',
    {
      enabled: goRefreshData,
      tipe: 'today_top_sale_item',
      date_from: format(subDays(new Date(), 7), 'yyyy-MM-dd', { locale: id }),
      date_to: format(new Date(), 'yyyy-MM-dd', { locale: id }),
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
  const columns = getTopItemsColumn();

  return (
    <>
      <Card className={cn('flex-1 rounded-xl')}>
        <CardHeader>
          <CardTitle className='text-lg font-semibold'>
            Item Paling Laku
          </CardTitle>
          <CardDescription className='text-xs'>
            berdasarkan jumlah quantity terjual
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
        <CardContent>
          {!isLoading && summaryData?.dataTopItem?.length === 0 && (
            <p className='text-xslg:text-sm'>Tidak Ada Data</p>
          )}
          <div className={cn('', className)}>
            <DataTable
              columns={columns}
              data={summaryData?.dataTopItem ? summaryData?.dataTopItem : []}
              numberOfPages={1}
              isLoading={isLoading}
              initPageSize={1}
              onPageSizeChange={setPageSize}
              currentPage={0}
              viewOptions={{
                showInputFilter: false,
                showColumnVisibility: false,
                showPagination: false,
              }}
            />
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default TopSaleItem;
