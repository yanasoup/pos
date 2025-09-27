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

import {
  useGetPurchasesReport,
  UseGetPurchasesReportParams,
} from '@/hooks/purchase/useGetPurchaseDetail';
import { exportToCsv, formatNumber } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { getColumns } from './columns';
import { DataTable } from '@/components/data-table';
const DEFAULT_PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 10;

const LaporanPembelianPage = () => {
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [currentPage, setCurrentPage] = React.useState(1);
  const uiuxState = useSelector((state: RootState) => state.uiux);
  const [goFilterData, setGoFilterData] = React.useState(false);
  const dfRef = React.useRef<Date | undefined>(undefined);
  const dtRef = React.useRef<Date | undefined>(undefined);
  const categoryRef = React.useRef<string>('');
  const productCodeRef = React.useRef<string>('');
  const supplierRef = React.useRef<string>('');
  const [queryString, setQueryString] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [goExport, setGoExport] = React.useState(false);

  const queryKey: UseGetPurchasesReportParams = [
    'purchases',
    {
      limit: pageSize,
      page: currentPage,
      queryString: debouncedSearch.length > 1 ? debouncedSearch : '',
      supplierId: supplierRef.current,
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

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(queryString);
    }, 300);

    return () => clearTimeout(timer);
  }, [queryString]);

  const { data: purchaseData, isPending: isFetching } =
    useGetPurchasesReport(queryKey);

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

  const handleFilterReport = (params: FilterParams) => {
    setGoFilterData(false);

    setCurrentPage(1);
    dfRef.current = params.dateFrom ? parseISO(params.dateFrom) : undefined;
    dtRef.current = params.dateTo ? parseISO(params.dateTo) : undefined;
    productCodeRef.current = params.productCode || '';
    categoryRef.current = params.categoryId || '';
    supplierRef.current = params.supplierId || '';

    setGoFilterData(true);
  };

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  const exportQueryKey: UseGetPurchasesReportParams = [
    'purchases',
    {
      limit: purchaseData?.data?.total || pageSize,
      page: 1,
      queryString: queryString,
      supplierId: supplierRef.current,
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
    useGetPurchasesReport(exportQueryKey);

  const handleExportData = () => {
    setGoExport(true);
  };

  React.useEffect(() => {
    if (exportData && goExport) {
      const columns = [
        'Tanggal',
        'Nama Barang',
        'Kategori',
        'Supplier',
        'Qty',
        'Harga',
        'Total Harga',
      ];

      const tmpData = exportData?.data?.data?.map((item) => {
        return [
          format(item?.purchase_date as Date, 'dd-MMM-yyyy', {
            locale: id,
          }),
          item?.product_name,
          item?.category_name,
          item?.supplier_name,
          item?.qty,
          item?.price,
          item?.price * item?.qty,
        ];
      });

      if (tmpData) {
        tmpData?.unshift(columns);
        const kini = format(new Date(), 'dd-MMM-yyyy-HHmm', { locale: id });
        exportToCsv(`export-laporan-pembelian-${kini}.csv`, tmpData);
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
            <div className='basis-80 text-xl font-bold'>Laporan Pembelian</div>
          </div>
          <DataFilter
            onFilter={handleFilterReport}
            isLoading={isFetching}
            options={{
              showProductFilter: true,
              showCategoryFilter: true,
              showExportButton: true,
            }}
            isExporting={isExporting}
            onExport={handleExportData}
          />
          <div>
            <div className='flex-between mb-4 flex'>
              <div className='text-muted-foreground text-left text-xs italic'>
                menampilkan {purchaseData?.data?.from}-{purchaseData?.data.to}{' '}
                dari {purchaseData?.data.total}
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
              data={purchaseData ? purchaseData?.data?.data : []}
              numberOfPages={purchaseData ? purchaseData?.data?.last_page : 0}
              onPageChange={handlePageChange}
              isLoading={isFetching}
              searchValue={queryString}
              onSearchChange={handleSearchChange}
              initPageSize={pageSize}
              onPageSizeChange={setPageSize}
              currentPage={currentPage - 1}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanPembelianPage;
