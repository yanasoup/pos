'use client';
import { CirclePlusIcon } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';

import MyConfirmationDialog from '@/components/partials/common/confirmation-dialog';
import AddProductCategoryDialog from '@/components/partials/product-category/add-product-category';
import EditProductCategoryDialog from '@/components/partials/product-category/edit-product-category';
import { Button } from '@/components/ui/button';

import {
  DeleteProductCategoryParams,
  useDeleteProductCategory,
} from '@/hooks/product-category/useDeleteProductCategory';
import { useGetProductCategories } from '@/hooks/product-category/useGetProductCategory';
import { RootState } from '@/redux/store';
import { DataTable } from '@/components/data-table';
import { getColumns } from './columns';

const DEFAULT_PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 10;

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const ProductCategories = () => {
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [queryString, setQueryString] = React.useState('');
  const [showCreateFormDialog, setShowCreateFormDialog] = React.useState(false);
  const [showEditFormDialog, setShowEditFormDialog] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const uiuxState = useSelector((state: RootState) => state.uiux);
  const { data: productCategoriesData, isFetching } = useGetProductCategories([
    'product-categories',
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
  } = useDeleteProductCategory({
    queryKey: [
      'product-categories',
      { limit: pageSize, page: currentPage },
      uiuxState?.apiToken || '',
    ],
  });
  const startDeleteHandler = (dataId: string) => {
    setShowDeleteDialog(true);
    setSelectedId(dataId);
  };
  const confirmDeleteHandler = (dataId: string) => {
    const deleteParams: DeleteProductCategoryParams = {
      categoryId: dataId,
      requestToken: uiuxState?.apiToken || '',
    };
    deleteFn(deleteParams);
  };

  React.useEffect(() => {
    if (isDeleteSuccess) {
      setShowDeleteDialog(false);
      toast.success('Hapus Kategori', {
        description: 'Kategori berhasil dihapus',
      });
    }

    if (deleteError) {
      toast.error('Hapus Kategori', {
        description: 'Kategori gagal dihapus',
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
              Kategori Barang
            </div>
            <div className='flex flex-1 basis-80 flex-wrap items-center justify-end md:gap-2'>
              <Button variant='default' onClick={startInputHandler}>
                <CirclePlusIcon />
                Tambah
              </Button>
            </div>
          </div>
          <DataTable
            columns={columns}
            data={
              productCategoriesData ? productCategoriesData?.data?.data : []
            }
            numberOfPages={
              productCategoriesData ? productCategoriesData?.data?.last_page : 0
            }
            onPageChange={handlePageChange}
            isLoading={isFetching}
            searchValue={queryString}
            onSearchChange={handleSearchChange}
            initPageSize={pageSize}
            onPageSizeChange={setPageSize}
            viewOptions={{
              showInputFilter: true,
              showColumnVisibility: true,
              showPagination: true,
            }}
            currentPage={currentPage - 1}
          />

          <AddProductCategoryDialog
            open={showCreateFormDialog}
            onOpenChange={handleCreateOpenChange}
            onSuccess={onSuccessHandler}
          />
          <EditProductCategoryDialog
            open={showEditFormDialog}
            onOpenChange={handleEditOpenChange}
            onSuccess={onSuccessHandler}
            dataId={selectedId || ''}
          />
          <MyConfirmationDialog
            title='Hapus Kategori'
            description='Anda yakin ingin menghapus kategori ini?'
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

export default ProductCategories;
