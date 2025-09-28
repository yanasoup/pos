'use client';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import React, { useCallback, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

import { FilterParams } from '@/components/partials/common/data-filter';
import DateFilter from '@/components/partials/common/data-filter';
import SaleDetailDialog from '@/components/partials/sale/detail-transaction';
import { Input } from '@/components/ui/input';

import { useGetSales, UseGetSalesParams } from '@/hooks/sale/useGetTransaction';
import { exportToCsv } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { getColumns } from './columns';
import { DataTable } from '@/components/data-table';
import UserCombobox from '@/components/partials/common/combobox-user';
import { Label } from '@/components/ui/label';
const DEFAULT_PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 10;

const PenjualanPage = () => {
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedMasterId, setSelectedMasterId] = React.useState<string | null>(
    null
  );
  const uiuxState = useSelector((state: RootState) => state.uiux);
  const [showDetailFormDialog, setShowDetailFormDialog] = React.useState(false);
  const [queryString, setQueryString] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [goFilterData, setGoFilterData] = React.useState(false);
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = React.useState<Date | undefined>(undefined);
  const dfRef = React.useRef<Date | undefined>(undefined);
  const dtRef = React.useRef<Date | undefined>(undefined);
  const [goExport, setGoExport] = React.useState(false);
  const kasir = useRef<string>('');

  const queryKey: UseGetSalesParams = [
    'purchases',
    {
      limit: pageSize,
      page: currentPage,
      queryString: debouncedSearch.length > 1 ? debouncedSearch : '',
      customerId: '',
      requestToken: uiuxState.apiToken!,
      enabled: goFilterData,
      date_from: dateFrom
        ? format(dateFrom.toISOString(), 'yyyy-MM-dd', { locale: id })
        : '',
      date_to: dateTo
        ? format(dateTo.toISOString(), 'yyyy-MM-dd', { locale: id })
        : '',
      cashier: kasir.current,
    },
  ];

  const {
    data: salesData,
    isPending: isFetching,
    error: fetchError,
  } = useGetSales(queryKey);

  React.useEffect(() => {
    const dateNow = new Date();
    const df = parseISO(format(dateNow, 'yyyy-MM-dd', { locale: id }));
    const dt = parseISO(
      format(dateNow, 'yyyy-MM-dd', {
        locale: id,
      })
    );
    setDateFrom(df);
    setDateTo(dt);
    dfRef.current = df;
    dtRef.current = dt;
    setGoFilterData(true);
  }, []);
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(queryString);
    }, 300);

    return () => clearTimeout(timer);
  }, [queryString]);

  const handleFilterReport = (params: FilterParams) => {
    setGoFilterData(false);

    setCurrentPage(1);
    setDateFrom(params.dateFrom ? parseISO(params.dateFrom) : undefined);
    setDateTo(params.dateTo ? parseISO(params.dateTo) : undefined);
    setGoFilterData(true);
  };

  const handlePurchaseDetailOpenChange = (open: boolean) => {
    setShowDetailFormDialog(open);
  };

  const startEditPurchaseDetailHandler = (dataId: string) => {
    setSelectedMasterId(dataId);
    setShowDetailFormDialog(true);
  };

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  const exportQueryKey: UseGetSalesParams = [
    'purchases',
    {
      ...queryKey[1],
      limit: salesData?.data?.total || pageSize,
      page: 1,
      enabled: goExport,
    },
  ];

  const { data: exportData, isFetching: isExporting } =
    useGetSales(exportQueryKey);

  const handleExportData = () => {
    setGoExport(true);
  };

  React.useEffect(() => {
    if (exportData && goExport) {
      const columns = [
        'Tanggal',
        'No. Penjualan',
        'Pelanggan',
        'Total Qty',
        'Total Harga',
        'Disc. Faktur',
        'Gross Margin',
        'Net. Margin',
        'Waktu Input',
      ];

      const tmpData = exportData?.data?.data?.map((item) => {
        return [
          format(item?.sale_date as Date, 'dd MMM yyyy', {
            locale: id,
          }),
          item?.sale_no,
          item?.customer,
          item?.total_qty,
          item?.total_price,
          item?.invoice_discount,
          item?.gross_margin,
          (item?.gross_margin || 0) - (item?.invoice_discount || 0),
          format(item?.created_at as Date, 'dd MMM yyyy HH:mm:ss', {
            locale: id,
          }),
        ];
      });

      if (tmpData) {
        tmpData?.unshift(columns);
        const kini = format(new Date(), 'dd-MMM-yyyy-HHmm', { locale: id });
        exportToCsv(`export-penjualan-${kini}.csv`, tmpData);
      } else {
        toast('tidak ada data');
      }

      setGoExport(false);
    }
  }, [exportData, goExport]);

  const columns = getColumns(startEditPurchaseDetailHandler);

  const handleSearchChange = useCallback((value: string) => {
    setCurrentPage(1);
    setQueryString(value);
  }, []);
  const confirmSelectKasir = (item: string) => {
    const arr = item.split('||');
    kasir.current = arr[0];
  };

  return (
    <div className='flex flex-1 flex-col'>
      <div className='@container/main flex flex-1 flex-col gap-2'>
        <div className='flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6'>
          <div className='flex flex-wrap items-center justify-between'>
            <div className='basis-80 text-xl font-bold'>Daftar Penjualan</div>
          </div>
          <DateFilter
            onFilter={handleFilterReport}
            isLoading={isFetching}
            options={{ showExportButton: true }}
            onExport={handleExportData}
            isExporting={isExporting}
          >
            <div className='flex flex-col'>
              <Label className='text-xs lg:text-sm'>Kasir</Label>
              <div className='text-muted-foreground flex items-center justify-center text-sm'>
                <UserCombobox onSelectConfirm={confirmSelectKasir} />
              </div>
            </div>
          </DateFilter>
          <div>
            <div className='flex-between mb-4 flex'>
              <div className='text-muted-foreground text-left text-xs italic'>
                menampilkan {salesData?.data?.from}-{salesData?.data.to} dari{' '}
                {salesData?.data.total}
              </div>
              <div className='flex flex-1 basis-80 flex-wrap items-center justify-end md:gap-2'>
                <Input
                  className='text-xs lg:w-80 lg:text-sm'
                  name='search'
                  placeholder='Cari...'
                  onChange={(e) => handleSearchChange(e.target.value)}
                  autoComplete='off'
                />
              </div>
            </div>

            <DataTable
              columns={columns}
              data={salesData ? salesData?.data?.data : []}
              numberOfPages={salesData ? salesData?.data?.last_page : 0}
              onPageChange={handlePageChange}
              isLoading={isFetching}
              searchValue={queryString}
              onSearchChange={handleSearchChange}
              initPageSize={pageSize}
              onPageSizeChange={setPageSize}
              currentPage={currentPage - 1}
            />
          </div>

          <SaleDetailDialog
            open={showDetailFormDialog}
            onOpenChange={handlePurchaseDetailOpenChange}
            masterId={selectedMasterId || ''}
          />
        </div>
      </div>
    </div>
  );
};

export default PenjualanPage;
