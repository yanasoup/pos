'use client';
import { format, parseISO, subDays } from 'date-fns';
import { id } from 'date-fns/locale';
import React, { useCallback, useRef, useState } from 'react';

import { DataTable } from '@/components/data-table';
import { getColumns } from './columns';
import {
  useGetShifts,
  UseGetShiftsParams,
} from '@/hooks/shift-kasir/useGetShift';
import DataFilter, {
  FilterParams,
} from '@/components/partials/common/data-filter';
import { Label } from '@/components/ui/label';
import UserCombobox from '@/components/partials/common/combobox-user';
import ShiftStatusCombobox from '@/components/partials/common/combobox-status-shift';
import BalanceDiffCombobox from '@/components/partials/common/combobox-balance-diff';
import { exportToCsv } from '@/lib/utils';
import { toast } from 'sonner';
import EditShiftDialog from '@/components/partials/shift-kasir/edit-shift';

const DEFAULT_PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 10;
// const DEFAULT_PAGE_SIZE = 2;

const ShiftKasirPage = () => {
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [queryString, setQueryString] = React.useState('');
  const [selectedId, setSelectedId] = React.useState<string | null>('');
  const dfRef = React.useRef<Date | undefined>(
    subDays(parseISO(format(new Date(), 'yyyy-MM-dd', { locale: id })), 3)
  );
  const dtRef = React.useRef<Date | undefined>(
    parseISO(format(new Date(), 'yyyy-MM-dd', { locale: id }))
  );
  const kasir = useRef<string>('');
  const status = useRef<string>('');
  const selisih = useRef<string>('');

  const queryKey = {
    limit: Number(pageSize),
    page: currentPage,
    queryString: debouncedSearch.length > 1 ? debouncedSearch : '',
    date_from: dfRef.current
      ? format(dfRef.current.toISOString(), 'yyyy-MM-dd', { locale: id })
      : '',
    date_to: dtRef.current
      ? format(dtRef.current.toISOString(), 'yyyy-MM-dd', { locale: id })
      : '',
    kasir: kasir.current,
    status: status.current,
    selisih: selisih.current,
  };

  const {
    data: shiftsData,
    isFetching,
    refetch,
  } = useGetShifts(['shifts', queryKey]);

  const startEditHandler = (dataId: string) => {
    setSelectedId(dataId);
    setShowOpenCashierDialog(true);
  };
  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  const onSuccessHandler = useCallback(() => {
    setSelectedId(null);
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(queryString);
    }, 500);

    return () => clearTimeout(timer);
  }, [queryString]);

  const columns = getColumns(startEditHandler);

  const handleSearchChange = useCallback((value: string) => {
    setCurrentPage(1);
    setQueryString(value);
  }, []);

  const handleFilterReport = (params: FilterParams) => {
    setCurrentPage(1);
    dfRef.current = params.dateFrom ? parseISO(params.dateFrom) : undefined;
    dtRef.current = params.dateTo ? parseISO(params.dateTo) : undefined;
    refetch();
  };

  const confirmSelectKasir = (item: string) => {
    const arr = item.split('||');
    kasir.current = arr[0];
  };
  const confirmSelectStatus = (item: string) => {
    status.current = item;
  };
  const confirmSelectSelisih = (item: string) => {
    selisih.current = item;
  };

  const [goExport, setGoExport] = useState(false);
  const handleExportData = () => {
    setGoExport(true);
  };

  const exportQueryKey: UseGetShiftsParams = [
    'export-shifts',
    {
      ...queryKey,
      limit: shiftsData?.data?.total || DEFAULT_PAGE_SIZE,
      page: 1,
      isEnabled: goExport,
    },
    // false,
  ];

  const { data: exportData, isFetching: isExporting } =
    useGetShifts(exportQueryKey);
  const [showOpenCashierDialog, setShowOpenCashierDialog] =
    React.useState(false);

  React.useEffect(() => {
    if (exportData && goExport) {
      const exportColumns = [
        'Tanggal',
        'Kasir',
        'Status',
        'Saldo Awal',
        'Saldo Akhir',
        'Saldo Sistem',
        'Selisih',
        'Buka',
        'Tutup',
        'Ditutup Oleh',
      ];

      const tmpData = exportData?.data?.data?.map((item) => {
        return [
          format(parseISO(item?.shift_date) as Date, 'dd-MMM-yyyy HH:mm:ss', {
            locale: id,
          }),
          item?.cashier_name,
          item?.closing_status,
          item?.opening_balance,
          item?.closing_balance,
          item?.system_balance,
          item?.difference,
          item?.opened_at,
          item?.closed_at,
          item?.closed_by,
        ];
      });

      if (tmpData) {
        tmpData?.unshift(exportColumns);
        const kini = format(new Date(), 'dd-MMM-yyyy-HHmm', { locale: id });
        exportToCsv(`export-shift-${kini}.csv`, tmpData);
      } else {
        toast('tidak ada data');
      }

      setGoExport(false);
    }
  }, [exportData, goExport]);

  return (
    <div className='flex flex-1 flex-col'>
      <div className='@container/main flex flex-1 flex-col gap-2'>
        <div className='flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6'>
          <div className='flex flex-wrap items-center justify-between'>
            <div className='text-accent-foreground basis-80 text-xl font-bold'>
              Shift Kasir
            </div>
          </div>
          <DataFilter
            onFilter={handleFilterReport}
            isLoading={isFetching}
            options={{
              showProductFilter: false,
              showCategoryFilter: false,
              showExportButton: true,
            }}
            onExport={handleExportData}
            isExporting={isExporting}
            initDateFrom={dfRef.current}
          >
            <div className='flex flex-col'>
              <Label className='text-xs lg:text-sm'>Kasir</Label>
              <div className='text-muted-foreground flex items-center justify-center text-sm'>
                <UserCombobox onSelectConfirm={confirmSelectKasir} />
              </div>
            </div>
            <div className='flex flex-col'>
              <Label className='text-xs lg:text-sm'>Status</Label>
              <div className='text-muted-foreground flex items-center justify-center text-sm'>
                <ShiftStatusCombobox onSelectConfirm={confirmSelectStatus} />
              </div>
            </div>
            <div className='flex flex-col'>
              <Label className='text-xs lg:text-sm'>Selisih</Label>
              <div className='text-muted-foreground flex items-center justify-center text-sm'>
                <BalanceDiffCombobox onSelectConfirm={confirmSelectSelisih} />
              </div>
            </div>
          </DataFilter>

          <DataTable
            columns={columns}
            data={shiftsData ? shiftsData?.data?.data : []}
            numberOfPages={shiftsData ? shiftsData?.data?.last_page : 0}
            onPageChange={handlePageChange}
            isLoading={isFetching}
            searchValue={queryString}
            onSearchChange={handleSearchChange}
            initPageSize={pageSize}
            onPageSizeChange={setPageSize}
            viewOptions={{
              showInputFilter: false,
              showColumnVisibility: false,
              showPagination: true,
            }}
            currentPage={currentPage - 1}
          />

          <EditShiftDialog
            onConfirm={onSuccessHandler}
            open={showOpenCashierDialog}
            onOpenChange={setShowOpenCashierDialog}
            confirmBtnText='Simpan'
            editId={selectedId || ''}
          />
        </div>
      </div>
    </div>
  );
};

export default ShiftKasirPage;
