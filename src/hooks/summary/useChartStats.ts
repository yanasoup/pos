// hooks/useChartStats.ts
import { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export type ChartData = {
  date: string;
  pembelian: number;
  penjualan: number;
};

type Trend = {
  status: 'naik' | 'turun' | 'tetap';
  percentage: number | null;
};

// hooks/useChartStats.ts
export function useChartStats(chartData: ChartData[]) {
  return useMemo(() => {
    const todayUTC = new Date();
    const today = parseISO(format(todayUTC, 'yyyy-MM-dd', { locale: id }));
    const yesterdayUTC = new Date();
    const yesterday = parseISO(
      format(yesterdayUTC, 'yyyy-MM-dd', { locale: id })
    );
    yesterday.setDate(today.getDate() - 1);

    const formatDate = (d: Date) => format(d, 'yyyy-MM-dd', { locale: id });
    const todayStr = formatDate(today);
    const yesterdayStr = formatDate(yesterday);

    const todayData = chartData?.find((d) => d.date === todayStr);
    const yesterdayData = chartData?.find((d) => d.date === yesterdayStr);

    const getTrend = (current: number, prev: number): Trend => {
      // const trendThreshold = 0.2; // 20% toleransi untuk menentukan "tetap"
      if (prev === 0) {
        return {
          status: current > 0 ? 'naik' : 'tetap',
          percentage: 100,
        };
      }
      const diff = current - prev;
      const percentage = (diff / prev) * 100;
      return {
        status: diff > 0 ? 'naik' : diff < 0 ? 'turun' : 'tetap',
        percentage,
      };
    };

    // bulan ini & bulan lalu
    const month = today.getMonth();
    const year = today.getFullYear();

    const thisMonthData = chartData?.filter((d) => {
      const dtUTC = new Date(d.date);
      const dt = parseISO(format(dtUTC, 'yyyy-MM-dd', { locale: id }));
      return dt.getMonth() === month && dt.getFullYear() === year;
    });

    const thisMonthDataWithoutLast = chartData?.filter((d) => {
      const dtUTC = new Date(d.date);
      const dt = parseISO(format(dtUTC, 'yyyy-MM-dd', { locale: id }));
      return dt.getMonth() === month && dt.getFullYear() === year;
    });
    thisMonthDataWithoutLast.pop();

    const lastMonthData = chartData?.filter((d) => {
      const dtUTC = new Date(d.date);
      const dt = parseISO(format(dtUTC, 'yyyy-MM-dd', { locale: id }));
      return dt.getMonth() === month - 1 && dt.getFullYear() === year;
    });
    const last2MonthData = chartData?.filter((d) => {
      const dtUTC = new Date(d.date);
      const dt = parseISO(format(dtUTC, 'yyyy-MM-dd', { locale: id }));
      return dt.getMonth() === month - 2 && dt.getFullYear() === year;
    });

    const sum = (arr: ChartData[], key: 'pembelian' | 'penjualan') =>
      arr?.reduce((acc, cur) => acc + cur[key], 0);

    const pembelianThisMonth = sum(thisMonthData, 'pembelian');
    const penjualanThisMonth = sum(thisMonthData, 'penjualan');

    const avgPembelianDailyThisMonth =
      sum(thisMonthDataWithoutLast, 'pembelian') /
      thisMonthDataWithoutLast.length;
    const avgPenjualanDailyThisMonth =
      sum(thisMonthDataWithoutLast, 'penjualan') /
      thisMonthDataWithoutLast.length;

    const pembelianLastMonth = sum(lastMonthData, 'pembelian');
    const penjualanLastMonth = sum(lastMonthData, 'penjualan');

    const pembelianToday = todayData?.pembelian ?? 0;
    const penjualanToday = todayData?.penjualan ?? 0;

    const avgPembelianMonthly =
      (sum(lastMonthData, 'pembelian') + sum(last2MonthData, 'pembelian')) / 2;
    const avgPenjualanMonthly =
      (sum(lastMonthData, 'penjualan') + sum(last2MonthData, 'penjualan')) / 2;

    return {
      today: {
        pembelian: pembelianToday,
        penjualan: penjualanToday,
      },
      todayTrend: {
        pembelian: getTrend(pembelianToday, yesterdayData?.pembelian ?? 0),
        penjualan: getTrend(penjualanToday, yesterdayData?.penjualan ?? 0),
        // 🔥 tambahan: compare today vs this month total
        pembelianVsMonth: getTrend(pembelianToday, avgPembelianDailyThisMonth),
        penjualanVsMonth: getTrend(penjualanToday, avgPenjualanDailyThisMonth),
      },
      thisMonth: {
        pembelian: pembelianThisMonth,
        penjualan: penjualanThisMonth,
      },
      monthTrend: {
        pembelian: getTrend(pembelianThisMonth, pembelianLastMonth),
        penjualan: getTrend(penjualanThisMonth, penjualanLastMonth),
        pembelianVsMonth: getTrend(pembelianThisMonth, avgPembelianMonthly),
        penjualanVsMonth: getTrend(penjualanThisMonth, avgPenjualanMonthly),
      },
    };
  }, [chartData]);
}
