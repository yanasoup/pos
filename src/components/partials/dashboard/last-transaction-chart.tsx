'use client';

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
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

import { useIsMobile } from '@/hooks/use-mobile';
import { format, getUnixTime, subDays } from 'date-fns';
import { id } from 'date-fns/locale';

import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

import { BeatLoader } from 'react-spinners';
import { ChartData } from '@/hooks/summary/useChartStats';

type Props = {
  className?: string;
  onDataLoad?: (data: ChartData[]) => void;
  onLoading: (isLoading: boolean) => void;
};
const LastTransactionChart: React.FC<Props> = ({
  className,
  onDataLoad,
  onLoading,
}) => {
  const [goRefreshData, setGoRefreshData] = React.useState(false);
  const uiuxState = useSelector((state: RootState) => state.uiux);
  const [requestTime, setRequestTime] = React.useState('');
  const queryKey: UseGetSummaryParams = [
    'summary',
    {
      enabled: goRefreshData,
      tipe: 'last_nday_transaction',
      date_from: format(subDays(new Date(), 90), 'yyyy-MM-dd', { locale: id }),
      date_to: format(new Date(), 'yyyy-MM-dd', { locale: id }),
      requestToken: uiuxState.apiToken!,
    },
    requestTime,
  ];

  const { data: summaryData, isLoading, isSuccess } = useGetSummary(queryKey);

  const handleRefreshData = () => {
    const dateNow = new Date();
    setGoRefreshData(false);
    setRequestTime(getUnixTime(dateNow).toString());
    setGoRefreshData(true);
  };

  React.useEffect(() => {
    onLoading(isLoading);
  }, [isLoading]);
  React.useEffect(() => {
    const dateNow = new Date();
    setRequestTime(getUnixTime(dateNow).toString());

    setGoRefreshData(true);
  }, []);

  const chartConfig = {
    pembelian: {
      label: 'Pembelian',
      color: 'var(--destructive)',
    },
    penjualan: {
      label: 'Penjualan',
      color: 'var(--primary)',
    },
  } satisfies ChartConfig;

  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState('90d');

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange('7d');
    }
  }, [isMobile]);

  const filteredData = summaryData?.chartData?.filter((item) => {
    const date = new Date(item.date);
    const referenceDate = new Date();
    let daysToSubtract = 90;
    if (timeRange === '30d') {
      daysToSubtract = 30;
    } else if (timeRange === '7d') {
      daysToSubtract = 7;
    }
    const startDate = new Date(referenceDate);
    startDate.setDate(startDate.getDate() - daysToSubtract);
    return date >= startDate;
  });

  React.useEffect(() => {
    if (isSuccess && onDataLoad) {
      onDataLoad(summaryData?.chartData || []);
    }
  }, [isSuccess]);

  return (
    <Card className={cn('@container/card', className)}>
      <CardHeader>
        <CardTitle className='text-lg font-semibold'>
          History Transaksi
        </CardTitle>
        <CardDescription>
          <span className='hidden @[540px]/card:block'>
            Total 3 Bulan terakhir
          </span>
          <span className='@[540px]/card:hidden'>3 Bulan terakhir</span>
        </CardDescription>

        <CardAction className='flex flex-row items-center justify-center gap-2'>
          <ToggleGroup
            type='single'
            value={timeRange}
            onValueChange={setTimeRange}
            variant='outline'
            className='hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex'
          >
            <ToggleGroupItem value='90d'>90 Hari terakhir</ToggleGroupItem>
            <ToggleGroupItem value='30d'>30 Hari terakhir</ToggleGroupItem>
            <ToggleGroupItem value='7d'>7 Hari terakhir</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className='flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden'
              size='sm'
              aria-label='Select a value'
            >
              <SelectValue placeholder='Last 3 months' />
            </SelectTrigger>
            <SelectContent className='rounded-xl'>
              <SelectItem value='90d' className='rounded-lg'>
                90 Hari terakhir
              </SelectItem>
              <SelectItem value='30d' className='rounded-lg'>
                30 Hari terakhir
              </SelectItem>
              <SelectItem value='7d' className='rounded-lg'>
                7 Hari terakhir
              </SelectItem>
            </SelectContent>
          </Select>

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
      <CardContent className='px-2 pt-4 sm:px-6 sm:pt-6'>
        {isLoading && (
          <div className='absolute flex h-[250px] w-full items-center justify-center'>
            <BeatLoader size={12} color='#d5d7da' />
          </div>
        )}

        <ChartContainer
          config={chartConfig}
          className='aspect-auto h-[250px] w-full'
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id='fillPembelian' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-pembelian)'
                  stopOpacity={1.0}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-pembelian)'
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id='fillPenjualan' x1='0' y1='0' x2='0' y2='1'>
                <stop
                  offset='5%'
                  stopColor='var(--color-penjualan)'
                  stopOpacity={0.8}
                />
                <stop
                  offset='95%'
                  stopColor='var(--color-penjualan)'
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey='date'
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });
                  }}
                  indicator='dot'
                />
              }
            />
            <Area
              dataKey='pembelian'
              type='natural'
              fill='url(#fillPembelian)'
              stroke='var(--color-pembelian)'
              stackId='a'
            />
            <Area
              dataKey='penjualan'
              type='natural'
              fill='url(#fillPenjualan)'
              stroke='var(--color-penjualan)'
              stackId='a'
            />
          </AreaChart>
        </ChartContainer>
        {/* )} */}
      </CardContent>
    </Card>
  );
};

export default LastTransactionChart;
