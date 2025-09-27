'use client';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { CirclePlusIcon, Search, ChevronDownIcon } from 'lucide-react';

import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { BeatLoader } from 'react-spinners';
import { toast } from 'sonner';

import SupplierCombobox from '@/components/partials/common/combobox-supplier';
import MyConfirmationDialog from '@/components/partials/common/confirmation-dialog';
import HeaderNavigation from '@/components/partials/layouts/header-navigation';
import AddPurchaseDialog from '@/components/partials/purchase/add-purchase';
import EditPurchaseDialog from '@/components/partials/purchase/edit-purchase';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import {
  useDeleteMasterPurchase,
  DeleteMasterPurchaseParams,
} from '@/hooks/purchase/useDeleteMasterPurchase';
import {
  useGetPurchases,
  UseGetPurchasesParams,
} from '@/hooks/purchase/useGetPurchase';
import { formatNumber } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { getColumns } from './columns';
import { DataTable } from '@/components/data-table';
const DEFAULT_PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 10;

const ProductPurchase = () => {
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [showCreateFormDialog, setShowCreateFormDialog] = React.useState(false);
  const [, setShowEditFormDialog] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [queryString, setQueryString] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [selectedMasterId, setSelectedMasterId] = React.useState<string | null>(
    null
  );
  const uiuxState = useSelector((state: RootState) => state.uiux);
  const [showEditDetailFormDialog, setShowEditDetailFormDialog] =
    React.useState(false);

  const supplierRef = React.useRef<string>('');
  const [supplier, setSupplier] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [openDf, setOpenDf] = React.useState(false);
  const [openDt, setOpenDt] = React.useState(false);
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = React.useState<Date | undefined>(undefined);
  const [goFilterData, setGoFilterData] = React.useState(false);
  const dfRef = React.useRef<Date | undefined>(undefined);
  const dtRef = React.useRef<Date | undefined>(undefined);

  const queryKey: UseGetPurchasesParams = [
    'purchases',
    {
      limit: pageSize,
      page: currentPage,
      queryString: debouncedSearch.length > 1 ? debouncedSearch : '',
      supplierId: supplier,
      requestToken: uiuxState.apiToken!,
      enabled: goFilterData,
      date_from: dateFrom
        ? format(dateFrom.toISOString(), 'yyyy-MM-dd', { locale: id })
        : '',
      date_to: dateTo
        ? format(dateTo.toISOString(), 'yyyy-MM-dd', { locale: id })
        : '',
    },
  ];

  const {
    data: purchasesData,
    isFetching,
    error: fetchError,
  } = useGetPurchases(queryKey);

  const {
    isPending: isDeletePending,
    isSuccess: isDeleteSuccess,
    error: deleteError,
    mutate: deleteFn,
  } = useDeleteMasterPurchase(queryKey);
  const startDeleteHandler = (dataId: string) => {
    setShowDeleteDialog(true);
    setSelectedId(dataId);
  };
  const confirmDeleteHandler = (dataId: string) => {
    const deleteParams: DeleteMasterPurchaseParams = {
      dataId: dataId,
      requestToken: uiuxState?.apiToken || '',
    };
    deleteFn(deleteParams);
  };

  React.useEffect(() => {
    if (isDeleteSuccess) {
      setShowDeleteDialog(false);
      toast.success('Hapus Pembelian', {
        description: 'Data Pembelian berhasil dihapus',
      });
    }
  }, [isDeleteSuccess]);
  React.useEffect(() => {
    if (deleteError) {
      toast.error('Hapus Pembelian', {
        description: 'Data Pembelian gagal dihapus',
      });
    }
  }, [deleteError]);

  const handleCreateOpenChange = (open: boolean) => {
    setShowCreateFormDialog(open);
  };

  const startInputHandler = () => {
    setShowCreateFormDialog(true);
  };

  const startEditPurchaseDetailHandler = (dataId: string) => {
    setSelectedMasterId(dataId);
    setShowEditDetailFormDialog(true);
  };

  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  const onSuccessHandler = useCallback(() => {
    setShowCreateFormDialog(false);
    setShowEditFormDialog(false);
    setShowEditDetailFormDialog(false);
    setSelectedId(null);
  }, []);
  const confirmSelectSupplier = (selected: string) => {
    const arr = selected.split('||');
    supplierRef.current = arr[0];
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(queryString);
    }, 300);

    return () => clearTimeout(timer);
  }, [queryString]);
  const handleFilterData = () => {
    setGoFilterData(false);
    setCurrentPage(1);
    setDateFrom(dfRef.current);
    setDateTo(dtRef.current);
    setSupplier(supplierRef.current);
    setGoFilterData(true);
  };

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
  const columns = getColumns(
    startEditPurchaseDetailHandler,
    startDeleteHandler
  );

  const handleSearchChange = useCallback((value: string) => {
    setCurrentPage(1);
    setQueryString(value);
  }, []);

  return (
    <div className='flex flex-1 flex-col'>
      <div className='@container/main flex flex-1 flex-col gap-2'>
        <div className='flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6'>
          <div className='flex flex-wrap items-center justify-between'>
            <div className='basis-80 text-xl font-bold'>Daftar Pembelian</div>
            <div className='flex flex-1 basis-80 flex-wrap items-center justify-end md:gap-2'>
              <Button variant='default' onClick={startInputHandler}>
                <CirclePlusIcon />
                Tambah
              </Button>
            </div>
          </div>
          <div className='border-border relative mt-4 flex flex-col flex-wrap items-center justify-start gap-2 rounded-xs border p-4 md:mt-2 lg:flex-row'>
            <span className='bg-sidebar border-border absolute top-0 -translate-y-1/2 rounded-full px-6 text-xs dark:border'>
              Filter
            </span>
            <div className='flex flex-col'>
              <Label htmlFor='date_from' className='text-xs lg:text-sm'>
                Tanggal:
              </Label>
              <div className='flex flex-col items-center justify-start gap-2 md:flex-row'>
                <Popover open={openDf} onOpenChange={setOpenDf}>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      id='date_from'
                      className='w-38 justify-between font-normal'
                    >
                      {dfRef.current
                        ? format(dfRef.current, 'dd MMM yyyy', { locale: id })
                        : 'dari'}
                      <ChevronDownIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className='w-auto overflow-hidden p-0'
                    align='start'
                  >
                    <Calendar
                      mode='single'
                      selected={dfRef.current}
                      captionLayout='dropdown'
                      onSelect={(date) => {
                        dfRef.current = date;
                        setOpenDf(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
                <span className='text-xs lg:text-sm'>s/d</span>
                <Popover open={openDt} onOpenChange={setOpenDt}>
                  <PopoverTrigger asChild>
                    <Button
                      variant='outline'
                      id='date_to'
                      className='w-38 justify-between font-normal'
                    >
                      {dtRef.current
                        ? format(dtRef.current, 'dd MMM yyyy', { locale: id })
                        : 'sampai'}
                      <ChevronDownIcon />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className='w-auto overflow-hidden p-0'
                    align='start'
                  >
                    <Calendar
                      mode='single'
                      selected={dtRef.current}
                      captionLayout='dropdown'
                      onSelect={(date) => {
                        dtRef.current = date;
                        setOpenDt(false);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className='flex flex-col flex-wrap items-center gap-2 md:justify-end lg:flex-row'>
              <div className='flex flex-col items-start gap-0'>
                <label className='text-xs lg:text-sm'>Supplier:</label>

                <SupplierCombobox
                  className='md:min-w-70'
                  defaultText='Semua Supplier'
                  onSelectConfirm={(value) => confirmSelectSupplier(value)}
                />
              </div>
              <div className='flex flex-col items-start gap-0'>
                <label className='text-xs lg:text-sm'>&nbsp;</label>
                <Button onClick={handleFilterData} disabled={isFetching}>
                  <Search />
                  {isFetching ? <BeatLoader /> : 'Filter'}
                </Button>
              </div>
            </div>
          </div>
          <div>
            <div className='flex-between mb-4 flex'>
              <div className='text-muted-foreground text-left text-xs italic'>
                menampilkan {purchasesData?.data?.from}-{purchasesData?.data.to}{' '}
                dari {purchasesData?.data.total}
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
              data={purchasesData ? purchasesData?.data?.data : []}
              numberOfPages={purchasesData ? purchasesData?.data?.last_page : 0}
              onPageChange={handlePageChange}
              isLoading={isFetching}
              searchValue={queryString}
              onSearchChange={handleSearchChange}
              initPageSize={pageSize}
              onPageSizeChange={setPageSize}
              currentPage={currentPage - 1}
            />
          </div>

          <MyConfirmationDialog
            title='Hapus Pembelian'
            description='Anda yakin ingin menghapus pembelian ini?'
            onConfirm={() =>
              selectedId !== null && confirmDeleteHandler(selectedId)
            }
            onCancel={() => setSelectedId(null)}
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            dataId={selectedId || ''}
            showLoader={isDeletePending}
          />
          <AddPurchaseDialog
            open={showCreateFormDialog}
            onOpenChange={handleCreateOpenChange}
            onSaveSuccess={onSuccessHandler}
            queryKey={queryKey}
          />
          <EditPurchaseDialog
            open={showEditDetailFormDialog}
            onOpenChange={setShowEditDetailFormDialog}
            onSaveSuccess={onSuccessHandler}
            masterId={selectedMasterId || ''}
            queryKey={queryKey}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductPurchase;
