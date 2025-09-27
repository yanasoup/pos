'use client';
import { format, getUnixTime, parseISO, lastDayOfMonth } from 'date-fns';
import { id } from 'date-fns/locale';
import { RefreshCcw, Info } from 'lucide-react';
import React from 'react';
import { useSelector } from 'react-redux';
import { BeatLoader } from 'react-spinners';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  UseGetSummaryParams,
  useGetSummary,
} from '@/hooks/summary/useGetSummary';
import { cn, formatNumber } from '@/lib/utils';
import { RootState } from '@/redux/store';

type SummaryCardProps = {
  title: string;
  className?: string;
  titleClassName?: string;
  transactionValueClassName?: string;
  amountValueClassName?: string;
  valueTitleClassName?: string;
  cardBtnClassName?: string;
  cardBtnIconClassName?: string;
  sumType?: string;
  description?: string;
};
const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  className = 'bg-white text-black',
  titleClassName = 'text-black',
  transactionValueClassName = 'text-black',
  amountValueClassName = 'text-black',
  valueTitleClassName = 'text-black',
  cardBtnClassName = '',
  cardBtnIconClassName = 'text-black',
  sumType = '',
  description = '',
}) => {
  const [goRefreshData, setGoRefreshData] = React.useState(false);
  const uiuxState = useSelector((state: RootState) => state.uiux);
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = React.useState<Date | undefined>(undefined);
  const [requestTime, setRequestTime] = React.useState('');

  const queryKey: UseGetSummaryParams = [
    'summary',
    {
      enabled: goRefreshData,
      tipe: sumType,
      date_from: dateFrom
        ? format(dateFrom.toISOString(), 'yyyy-MM-dd', { locale: id })
        : '',
      date_to: dateTo
        ? format(dateTo.toISOString(), 'yyyy-MM-dd', { locale: id })
        : '',
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
    const df = parseISO(format(dateNow, 'yyyy-MM-01', { locale: id }));
    const dt = parseISO(
      format(lastDayOfMonth(dateNow), 'yyyy-MM-dd', {
        locale: id,
      })
    );

    setDateFrom(df);
    setDateTo(dt);
    setRequestTime(getUnixTime(dateNow).toString());

    setGoRefreshData(true);
  }, []);

  return (
    <div
      className={cn(
        'flex min-h-[135px] flex-col overflow-hidden rounded-xl px-4 py-2',
        className
      )}
    >
      <div className='flex-between flex items-center'>
        <span className={cn('font-semibold', titleClassName)}>{title}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleRefreshData}
              variant='ghost'
              className={cn(cardBtnClassName)}
              disabled={isLoading}
            >
              <RefreshCcw
                className={cn(
                  'size-5',
                  cardBtnIconClassName,
                  isLoading ? 'animate-spin' : ''
                )}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side='top'>Muat Ulang</TooltipContent>
        </Tooltip>
      </div>
      <div className='mt-2 flex items-center justify-start'>
        <span
          className={cn('text-3xl font-semibold', transactionValueClassName)}
        >
          {formatNumber(summaryData?.data?.count || 0)}
        </span>
        <span className={cn(valueTitleClassName)}>Trx</span>
      </div>
      <div className='flex items-center justify-start'>
        {isLoading ? (
          <BeatLoader size={10} color='#535862' />
        ) : (
          <>
            <span className={cn('text-3xl font-semibold', valueTitleClassName)}>
              Rp
            </span>
            <span
              className={cn('text-3xl font-semibold', amountValueClassName)}
            >
              {formatNumber(summaryData?.data?.amount || 0)}
            </span>
          </>
        )}
      </div>
      {description && (
        <div className='mt-2 flex items-center justify-start gap-2 text-xs text-neutral-500'>
          <Info className='size-8 text-neutral-500' />
          {description}
        </div>
      )}
    </div>
  );
};

export default SummaryCard;
