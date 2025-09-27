'use client';
import { CirclePlusIcon, SquarePenIcon, Trash2Icon } from 'lucide-react';
import Image from 'next/image';
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { BeatLoader } from 'react-spinners';
import { toast } from 'sonner';

import MyConfirmationDialog from '@/components/partials/common/confirmation-dialog';
import { Paginator } from '@/components/partials/common/paginator';
import HeaderNavigation from '@/components/partials/layouts/header-navigation';
import AddSupplierDialog from '@/components/partials/suppier/add-supplier';
import EditSupplierDialog from '@/components/partials/suppier/edit-supplier';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

import NotFoundBG from '@/assets/images/no-data-found.jpg';
import {
  DeleteSupplierParams,
  useDeleteSupplier,
} from '@/hooks/supplier/useDeleteSupplier';
import { useGetSuppliers } from '@/hooks/supplier/useGetSupplier';
import { RootState } from '@/redux/store';
import { Supplier } from '@/types/supplier';
import { getColumns } from './columns';
import { is } from 'date-fns/locale';
import { DataTable } from '@/components/data-table';

const DEFAULT_PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 10;

const SupplierPage = () => {
  const [pageSize, setPageSize] = React.useState(DEFAULT_PAGE_SIZE);
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [queryString, setQueryString] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [showCreateFormDialog, setShowCreateFormDialog] = React.useState(false);
  const [showEditFormDialog, setShowEditFormDialog] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const uiuxState = useSelector((state: RootState) => state.uiux);
  const {
    data: suppliersData,
    isLoading,
    error: fetchError,
  } = useGetSuppliers([
    'suppliers',
    {
      limit: Number(pageSize),
      page: currentPage,
      queryString: debouncedSearch.length > 1 ? debouncedSearch : '',
    },
    uiuxState.apiToken!,
  ]);

  const {
    isPending: isDeletePending,
    isSuccess: isDeleteSuccess,
    error: deleteError,
    mutate: deleteFn,
  } = useDeleteSupplier({
    queryKey: [
      'suppliers',
      { limit: pageSize, page: currentPage },
      uiuxState?.apiToken || '',
    ],
  });
  const startDeleteHandler = (dataId: string) => {
    setShowDeleteDialog(true);
    setSelectedId(dataId);
  };
  const confirmDeleteHandler = (dataId: string) => {
    const deleteParams: DeleteSupplierParams = {
      dataId: dataId,
      requestToken: uiuxState?.apiToken || '',
    };
    deleteFn(deleteParams);
  };

  React.useEffect(() => {
    if (isDeleteSuccess) {
      setShowDeleteDialog(false);
      toast.success('Hapus Pemasok', {
        description: 'Pemasok berhasil dihapus',
      });
    }

    if (deleteError) {
      toast.error('Hapus Pemasok', {
        description: 'Pemasok gagal dihapus',
      });
    }
  }, [isDeleteSuccess, deleteError]);

  const handleCreateOpenChange = (open: boolean) => {
    setShowCreateFormDialog(open);
  };
  const handleEditOpenChange = (open: boolean) => {
    setShowEditFormDialog(open);
  };

  const startInputHandler = () => {
    setShowCreateFormDialog(true);
  };
  const startEditHandler = (dataId: string) => {
    setSelectedId(dataId);
    setShowEditFormDialog(true);
  };
  function handlePageChange(page: number) {
    setCurrentPage(page);
  }

  const onSuccessHandler = useCallback(() => {
    setShowCreateFormDialog(false);
    setShowEditFormDialog(false);
    setSelectedId(null);
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(queryString);
    }, 500);

    return () => clearTimeout(timer);
  }, [queryString]);

  const columns = getColumns(startEditHandler, startDeleteHandler);

  const handleSearchChange = useCallback((value: string) => {
    setCurrentPage(1);
    setQueryString(value);
  }, []);

  return (
    <div className='flex flex-1 flex-col'>
      <div className='@container/main flex flex-1 flex-col gap-2'>
        <div className='flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6'>
          <div className='flex flex-wrap items-center justify-between'>
            <div className='text-accent-foreground basis-80 text-xl font-bold'>
              Pemasok
            </div>
            <div className='flex flex-1 basis-80 flex-wrap items-center justify-end md:gap-2'>
              <Input
                className='hidden text-xs lg:w-80 lg:text-sm'
                name='search'
                placeholder='Cari pemasok...'
                onChange={(e) => handleSearchChange(e.target.value)}
                autoComplete='off'
              />
              <div className='hidden h-10 w-0.25 lg:block' />
              <Button variant='default' onClick={startInputHandler}>
                <CirclePlusIcon />
                Tambah
              </Button>
            </div>
          </div>
          <DataTable
            columns={columns}
            data={suppliersData ? suppliersData?.data?.data : []}
            numberOfPages={suppliersData ? suppliersData?.data?.last_page : 0}
            onPageChange={handlePageChange}
            isLoading={isLoading}
            searchValue={queryString}
            onSearchChange={handleSearchChange}
            initPageSize={pageSize}
            onPageSizeChange={setPageSize}
            viewOptions={{
              showInputFilter: true,
              showColumnVisibility: true,
            }}
            currentPage={currentPage - 1}
          />
          <AddSupplierDialog
            open={showCreateFormDialog}
            onOpenChange={handleCreateOpenChange}
            onSuccess={onSuccessHandler}
          />
          <EditSupplierDialog
            open={showEditFormDialog}
            onOpenChange={handleEditOpenChange}
            onSuccess={onSuccessHandler}
            dataId={selectedId || ''}
          />
          <MyConfirmationDialog
            title='Hapus Supplier'
            description='Anda yakin ingin menghapus supplier ini?'
            onConfirm={() =>
              selectedId !== null && confirmDeleteHandler(selectedId)
            }
            onCancel={() => setSelectedId(null)}
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            dataId={selectedId || 0}
            showLoader={isDeletePending}
          />
        </div>
      </div>
    </div>
  );
};

export default SupplierPage;
