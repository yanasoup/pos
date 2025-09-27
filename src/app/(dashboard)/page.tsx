'use client';
import { SectionCards } from '@/components/partials/dashboard/section-cards';

import TopSaleItem from '@/components/partials/dashboard/top-sale-item';
import TopCategory from '@/components/partials/dashboard/top-category';
import LowStockItem from '@/components/partials/dashboard/low-stok-item';
import LastTransactionChart from '@/components/partials/dashboard/last-transaction-chart';
import { ChartData } from '@/hooks/summary/useChartStats';
import { useState } from 'react';

export default function Page() {
  const [chartDatas, setChartDatas] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const chartDataLoadedHandler = (data: ChartData[]) => {
    setChartDatas(data);
  };
  const chartDataLoadingHandler = (isLoading: boolean) => {
    setLoading(isLoading);
  };

  return (
    <div className='flex flex-1 flex-col'>
      <div className='@container/main flex flex-1 flex-col gap-2 pb-6'>
        <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
          <SectionCards statsData={chartDatas} isLoading={loading} />
          <div className='px-4 lg:px-6'>
            <LastTransactionChart
              onDataLoad={chartDataLoadedHandler}
              onLoading={chartDataLoadingHandler}
            />
          </div>
        </div>
        <div className='grid grid-cols-1 gap-4 overflow-auto px-4 lg:grid-cols-2 lg:gap-6 lg:px-6'>
          <TopSaleItem className='max-h-125 overflow-auto' />
          <TopCategory className='max-h-125 overflow-auto' />
          <LowStockItem className='max-h-125 overflow-auto' />
        </div>
      </div>
    </div>
  );
}
