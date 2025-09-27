'use client';
import React from 'react';
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';

import { format, getUnixTime, parseISO, lastDayOfMonth } from 'date-fns';
import { id } from 'date-fns/locale';

import { useSelector } from 'react-redux';

import {
  UseGetSummaryParams,
  useGetSummary,
} from '@/hooks/summary/useGetSummary';
import { cn, formatNumber } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { BeatLoader } from 'react-spinners';

type CardProps = {
  title: string;
  sumValue: number;
  trendStatusHeader: 'naik' | 'turun' | 'tetap';
  trendPercentageHeader: number | null;
  trendStatusFooter: 'naik' | 'turun' | 'tetap';
  trendPercentageFooter: number | null;
  statsType: 'daily' | 'monthly' | 'yearly';
  isLoading: boolean;
};
const SectionCard: React.FC<CardProps> = ({
  title,
  sumValue,
  trendStatusHeader,
  trendPercentageHeader,
  trendStatusFooter,
  trendPercentageFooter,
  statsType,
  isLoading,
}) => {
  let trendStatusDescription = '';

  if (['naik', 'turun'].includes(trendStatusFooter)) {
    if (trendStatusFooter === 'naik') {
      trendStatusDescription = `Meningkat ${formatNumber(Math.abs(trendPercentageFooter || 0), 1)}%`;
    } else if (trendStatusFooter === 'turun') {
      trendStatusDescription = `Menurun ${formatNumber(Math.abs(trendPercentageFooter || 0), 1)}%`;
    }
    if (statsType === 'daily') {
      trendStatusDescription += ' dari rata-rata bulan ini';
    } else if (statsType === 'monthly') {
      trendStatusDescription += ' dari rata-rata bulan sebelumnya';
    } else if (statsType === 'yearly') {
      trendStatusDescription += ' dari tahun sebelumnya';
    }
  } else {
    trendStatusDescription = 'Tidak ada perubahan';
  }

  return (
    <Card className='@container/card'>
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl'>
          {isLoading && <BeatLoader color='#d5d7da' size={6} />}
          {!isLoading && formatNumber(sumValue || 0)}
        </CardTitle>
        <CardAction>
          <Badge variant='outline'>
            {trendStatusHeader === 'naik' ? (
              <IconTrendingUp className='text-[green]' />
            ) : trendStatusHeader === 'tetap' ? (
              ' ~ '
            ) : (
              <IconTrendingDown className='text-destructive' />
            )}
            {trendStatusHeader === 'naik' ? '+' : ''}
            {formatNumber(trendPercentageHeader || 0, 1)}%
          </Badge>
        </CardAction>
      </CardHeader>
      <CardFooter className='flex-col items-start gap-1.5 text-sm'>
        <div className='line-clamp-1 flex gap-2 font-medium'>
          Trending {statsType === 'daily' ? ' bulan ini' : ' 90 hari terakhir '}
          {trendStatusFooter === 'naik' ? (
            <IconTrendingUp className='size-4' />
          ) : trendStatusFooter === 'tetap' ? (
            ' ~ '
          ) : (
            <IconTrendingDown className='size-4' />
          )}
        </div>
        <div className='text-muted-foreground'>{trendStatusDescription}</div>
      </CardFooter>
    </Card>
  );
};

export default SectionCard;
