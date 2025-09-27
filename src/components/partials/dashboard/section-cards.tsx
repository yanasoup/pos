'use client';
import SectionCard from './section-card';
import { ChartData, useChartStats } from '@/hooks/summary/useChartStats';

type Props = {
  statsData: ChartData[];
  isLoading: boolean;
};
export const SectionCards: React.FC<Props> = ({ statsData, isLoading }) => {
  const stats = useChartStats(statsData);
  return (
    <div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
      <SectionCard
        title='Pembelian Hari Ini'
        sumValue={stats.today.pembelian}
        trendStatusHeader={stats.todayTrend.pembelian.status}
        trendPercentageHeader={stats.todayTrend.pembelian.percentage}
        trendStatusFooter={stats.todayTrend.pembelianVsMonth.status}
        trendPercentageFooter={stats.todayTrend.pembelianVsMonth.percentage}
        statsType='daily'
        isLoading={isLoading}
      />
      <SectionCard
        title='Penjualan Hari Ini'
        sumValue={stats.today.penjualan}
        trendStatusHeader={stats.todayTrend.penjualan.status}
        trendPercentageHeader={stats.todayTrend.penjualan.percentage}
        trendStatusFooter={stats.todayTrend.penjualanVsMonth.status}
        trendPercentageFooter={stats.todayTrend.penjualanVsMonth.percentage}
        statsType='daily'
        isLoading={isLoading}
      />
      <SectionCard
        title='Pembelian Bulan Ini'
        sumValue={stats.thisMonth.pembelian}
        trendStatusHeader={stats.monthTrend.pembelian.status}
        trendPercentageHeader={stats.monthTrend.pembelian.percentage}
        trendStatusFooter={stats.monthTrend.pembelianVsMonth.status}
        trendPercentageFooter={stats.monthTrend.pembelianVsMonth.percentage}
        statsType='monthly'
        isLoading={isLoading}
      />
      <SectionCard
        title='Penjualan Bulan Ini'
        sumValue={stats.thisMonth.penjualan}
        trendStatusHeader={stats.monthTrend.penjualan.status}
        trendPercentageHeader={stats.monthTrend.penjualan.percentage}
        trendStatusFooter={stats.monthTrend.penjualanVsMonth.status}
        trendPercentageFooter={stats.monthTrend.penjualanVsMonth.percentage}
        statsType='monthly'
        isLoading={isLoading}
      />
    </div>
  );
};
