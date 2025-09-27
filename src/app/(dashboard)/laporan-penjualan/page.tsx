'use client';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';

import { toast } from 'sonner';

import DataFilter, {
  FilterParams,
} from '@/components/partials/common/data-filter';

import { Input } from '@/components/ui/input';

import { UseGetSalesParams } from '@/hooks/sale/useGetTransaction';
import { useGetSalesReport } from '@/hooks/sale/useGetTransactionDetail';
import { formatNumber, exportToCsv } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { getColumns } from './columns';
import { DataTable } from '@/components/data-table';
import { TableCell, TableFooter, TableRow } from '@/components/ui/table';
const DEFAULT_PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 10;

const LaporanPenjualanPage = () => {
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = React.useState(1);
  const uiuxState = useSelector((state: RootState) => state.uiux);
  const [goFilterData, setGoFilterData] = React.useState(false);
  const dfRef = React.useRef<Date | undefined>(undefined);
  const dtRef = React.useRef<Date | undefined>(undefined);
  const categoryRef = React.useRef<string>('');
  const productCodeRef = React.useRef<string>('');
  const [queryString, setQueryString] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [goExport, setGoExport] = React.useState(false);

  const queryKey: UseGetSalesParams = [
    'purchases',
    {
      limit: pageSize,
      page: currentPage,
      queryString: debouncedSearch.length > 1 ? debouncedSearch : '',
      customerId: '',
      requestToken: uiuxState.apiToken!,
      enabled: goFilterData,
      date_from: dfRef.current
        ? format(dfRef.current.toISOString(), 'yyyy-MM-dd', { locale: id })
        : '',
      date_to: dtRef.current
        ? format(dtRef.current.toISOString(), 'yyyy-MM-dd', { locale: id })
        : '',
      categoryId: categoryRef.current,
      product_code: productCodeRef.current,
    },
  ];

  const {
    data: salesData,
    isPending: isFetching,
    error: fetchError,
  } = useGetSalesReport(queryKey);

  React.useEffect(() => {
    const dateNow = new Date();
    const df = parseISO(format(dateNow, 'yyyy-MM-dd', { locale: id }));
    const dt = parseISO(
      format(dateNow, 'yyyy-MM-dd', {
        locale: id,
      })
    );

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
    dfRef.current = params.dateFrom ? parseISO(params.dateFrom) : undefined;
    dtRef.current = params.dateTo ? parseISO(params.dateTo) : undefined;
    productCodeRef.current = params.productCode || '';
    categoryRef.current = params.categoryId || '';

    setGoFilterData(true);
  };

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  const exportQueryKey: UseGetSalesParams = [
    'purchases',
    {
      limit: salesData?.data?.total || pageSize,
      page: 1,
      queryString: queryString,
      customerId: '',
      requestToken: uiuxState.apiToken!,
      enabled: goExport,
      date_from: dfRef.current
        ? format(dfRef.current.toISOString(), 'yyyy-MM-dd', { locale: id })
        : '',
      date_to: dtRef.current
        ? format(dtRef.current.toISOString(), 'yyyy-MM-dd', { locale: id })
        : '',
      categoryId: categoryRef.current,
      product_code: productCodeRef.current,
    },
  ];

  const { data: exportData, isFetching: isExporting } =
    useGetSalesReport(exportQueryKey);

  const handleExportData = () => {
    setGoExport(true);
  };

  React.useEffect(() => {
    if (exportData && goExport) {
      const columns = [
        'Waktu',
        'Nama Barang',
        'Kategori',
        'Qty',
        'HPP',
        'Harga Jual',
        'Total Harga',
        'Margin',
      ];

      const tmpData = exportData?.data?.data?.map((item) => {
        return [
          format(item?.created_at as Date, 'dd-MMM-yyyy HH:mm:ss', {
            locale: id,
          }),
          item?.product_name,
          item?.category_name,
          item?.qty,
          item?.price_cogs,
          item?.price,
          item?.price * item?.qty,
          item?.price * item?.qty - item?.price_cogs * item?.qty,
        ];
      });

      if (tmpData) {
        tmpData?.unshift(columns);
        const kini = format(new Date(), 'dd-MMM-yyyy-HHmm', { locale: id });
        exportToCsv(`export-laporan-penjualan-${kini}.csv`, tmpData);
      } else {
        toast('tidak ada data');
      }

      setGoExport(false);
    }
  }, [exportData, goExport]);
  const columns = getColumns();

  const handleSearchChange = useCallback((value: string) => {
    setCurrentPage(1);
    setQueryString(value);
  }, []);

  return (
    <div className='flex flex-1 flex-col'>
      <div className='@container/main flex flex-1 flex-col gap-2'>
        <div className='flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6'>
          <div className='flex flex-wrap items-center justify-between'>
            <div className='basis-80 text-xl font-bold'>Laporan Penjualan</div>
            <div className='flex flex-1 basis-80 flex-wrap items-center justify-end md:gap-2'>
              <Input
                className='text-xs lg:w-80 lg:text-sm'
                name='search'
                placeholder='Cari...'
                onChange={(e) => setQueryString(e.target.value)}
                autoComplete='off'
              />
            </div>
          </div>
          <DataFilter
            onFilter={handleFilterReport}
            isLoading={isFetching}
            options={{
              showProductFilter: true,
              showCategoryFilter: true,
              showExportButton: true,
            }}
            onExport={handleExportData}
            isExporting={isExporting}
          />
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
            >
              <TableFooter>
                <TableRow className='bg-muted'>
                  <TableCell colSpan={7}>Total:</TableCell>
                  <TableCell className='text-right'>
                    {formatNumber(salesData?.aggregate?.total_harga || 0)}
                  </TableCell>
                  <TableCell> </TableCell>
                  <TableCell className='text-right'>
                    {formatNumber(salesData?.aggregate?.total_margin || 0)}
                  </TableCell>
                </TableRow>
              </TableFooter>
            </DataTable>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanPenjualanPage;
