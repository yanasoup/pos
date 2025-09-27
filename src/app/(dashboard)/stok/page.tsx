'use client';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Download, Search } from 'lucide-react';

import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { BeatLoader } from 'react-spinners';
import { toast } from 'sonner';

import CategoryCombobox from '@/components/partials/common/combobox-category';
import HeaderNavigation from '@/components/partials/layouts/header-navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { useGetStock, UseGetStockParams } from '@/hooks/stock/useGetStock';
import { exportToCsv } from '@/lib/utils';
import { RootState } from '@/redux/store';

import { getColumns } from './columns';
import { DataTable } from '@/components/data-table';

const DEFAULT_PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 10;

const StokPage = () => {
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = React.useState(1);
  const uiuxState = useSelector((state: RootState) => state.uiux);
  const [queryString, setQueryString] = React.useState('');
  const categoryRef = React.useRef<string>('');
  const [category, setCategory] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [goExport, setGoExport] = React.useState(false);
  const {
    data: stocksData,
    isLoading: isFetching,
    error: fetchError,
  } = useGetStock([
    'stocks',
    {
      limit: pageSize,
      page: currentPage,
      queryString: debouncedSearch.length > 1 ? debouncedSearch : '',
      categoryId: category,
    },
    uiuxState.apiToken!,
  ]);

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  const confirmSelectCategory = (category: string) => {
    const arr = category.split('||');
    categoryRef.current = arr[0];
  };
  const handleFilterData = () => {
    setCurrentPage(1);
    setCategory(categoryRef.current);
  };
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(queryString);
    }, 300);

    return () => clearTimeout(timer);
  }, [queryString]);

  const exportQueryKey: UseGetStockParams = [
    'stocks',
    {
      limit: stocksData?.data?.total || pageSize,
      page: 1,
      queryString: queryString,
      categoryId: category,
      enabled: goExport,
    },
    uiuxState.apiToken!,
  ];

  const { data: exportData, isLoading: isExporting } =
    useGetStock(exportQueryKey);

  const handleExportData = () => {
    setGoExport(true);
  };

  React.useEffect(() => {
    if (exportData && goExport) {
      const columns = [
        'Kode Barang',
        'Nama Barang',
        'Stok',
        'Satuan',
        'Kategori',
      ];

      const tmpData = exportData?.data?.data?.map((item) => {
        return [
          item.product_code,
          item?.product_name,
          item?.current_balance,
          item?.unit,
          item?.category_name,
        ];
      });

      if (tmpData) {
        tmpData?.unshift(columns);
        const kini = format(new Date(), 'dd-MMM-yyyy-HHmm', { locale: id });
        exportToCsv(`export-stok-barang-${kini}.csv`, tmpData);
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
            <div className='basis-80 text-xl font-bold'>Stok Barang</div>
          </div>
          <div className='border-border relative mt-2 flex flex-wrap items-center justify-start gap-2 rounded-xs border p-4'>
            <span className='bg-sidebar border-border absolute top-0 -translate-y-1/2 rounded-full px-6 text-xs dark:border'>
              Filter
            </span>
            <div className='flex flex-col gap-0'>
              <label className='text-xs lg:text-sm'>
                Cari Nama / Kode Barang:
              </label>
              <Input
                className='text-xs lg:w-80 lg:text-sm'
                name='search'
                placeholder='Cari...'
                onChange={(e) => handleSearchChange(e.target.value)}
                autoComplete='off'
              />
            </div>
            <div className='flex flex-wrap items-center gap-2 md:justify-end'>
              <div className='flex flex-col items-start gap-0'>
                <label className='text-xs lg:text-sm'>Kategori:</label>
                <CategoryCombobox
                  className='md:min-w-70'
                  defaultText='Semua Kategori'
                  onSelectConfirm={(value) => confirmSelectCategory(value)}
                />
              </div>
              <div className='flex flex-col items-start gap-0'>
                <label className='text-xs lg:text-sm'>&nbsp;</label>
                <div className='flex flex-col gap-2 lg:flex-row'>
                  <Button onClick={handleFilterData} variant='default'>
                    <Search />
                    Filter
                  </Button>
                  <Button
                    onClick={handleExportData}
                    variant='ghost'
                    disabled={isExporting}
                  >
                    {isExporting ? (
                      <BeatLoader />
                    ) : (
                      <>
                        <Download />
                        Download CSV
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DataTable
            columns={columns}
            data={stocksData ? stocksData?.data?.data : []}
            numberOfPages={stocksData ? stocksData?.data?.last_page : 0}
            onPageChange={handlePageChange}
            isLoading={isFetching}
            searchValue={queryString}
            onSearchChange={handleSearchChange}
            initPageSize={pageSize}
            onPageSizeChange={setPageSize}
            showInputFilter={true}
            showColumnVisibility={false}
            currentPage={currentPage - 1}
          />
        </div>
      </div>
    </div>
  );
};

export default StokPage;
