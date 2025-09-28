'use client';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { CirclePlusIcon, Search, Download } from 'lucide-react';

import React, { useCallback, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { BeatLoader } from 'react-spinners';
import { toast } from 'sonner';

import CategoryCombobox from '@/components/partials/common/combobox-category';
import MyConfirmationDialog from '@/components/partials/common/confirmation-dialog';

import AddProductDialog from '@/components/partials/product/add-product';
import EditProductDialog from '@/components/partials/product/edit-product';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  useDeleteProduct,
  DeleteProductParams,
} from '@/hooks/product/useDeleteProduct';
import {
  useGetProducts,
  UseGetProductsParams,
} from '@/hooks/product/useGetProduct';
import { exportToCsv } from '@/lib/utils';
import { RootState } from '@/redux/store';

import { DataTable } from '@/components/data-table';
import { getColumns } from './columns';

const DEFAULT_PAGE_SIZE = Number(process.env.NEXT_PUBLIC_PAGE_SIZE) || 10;

const ProductInventories = () => {
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [queryString, setQueryString] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [showCreateFormDialog, setShowCreateFormDialog] = React.useState(false);
  const [showEditFormDialog, setShowEditFormDialog] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const uiuxState = useSelector((state: RootState) => state.uiux);
  const [category, setCategory] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  const categoryRef = React.useRef<string>('');
  const [goExport, setGoExport] = React.useState(false);

  const queryKey: UseGetProductsParams = useMemo(() => {
    return [
      'product-inventories',
      {
        limit: Number(pageSize),
        page: currentPage,
        queryString: debouncedSearch.length > 1 ? debouncedSearch : '',
        categoryId: category,
        enabled: true,
      },
      uiuxState.apiToken!,
    ];
  }, [pageSize, currentPage, debouncedSearch, category, uiuxState.apiToken]);

  const { data: productsData, isFetching } = useGetProducts(queryKey);

  const exportQueryKey: UseGetProductsParams = useMemo(() => {
    return [
      'product-inventories',
      {
        limit: productsData?.data?.total || pageSize,
        page: 1,
        queryString: queryString,
        categoryId: category,
        enabled: goExport,
      },
      uiuxState.apiToken!,
    ];
  }, [
    goExport,
    queryString,
    category,
    uiuxState.apiToken,
    productsData?.data?.total,
  ]);
  const { data: ExportProductsData, isFetching: ExportIsFetching } =
    useGetProducts(exportQueryKey);

  const {
    isPending: isDeletePending,
    isSuccess: isDeleteSuccess,
    error: deleteError,
    mutate: deleteFn,
  } = useDeleteProduct(queryKey);
  const startDeleteHandler = (dataId: string) => {
    setShowDeleteDialog(true);
    setSelectedId(dataId);
  };
  const confirmDeleteHandler = (dataId: string) => {
    const deleteParams: DeleteProductParams = {
      dataId: dataId,
      requestToken: uiuxState?.apiToken || '',
    };
    deleteFn(deleteParams);
  };

  React.useEffect(() => {
    if (isDeleteSuccess) {
      setShowDeleteDialog(false);
      toast.success('Hapus Barang', {
        description: 'Barang berhasil dihapus',
      });
    }

    if (deleteError) {
      toast.error('Hapus Barang', {
        description: 'Barang gagal dihapus',
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

  const confirmSelectCategory = (category: string) => {
    const arr = category.split('||');
    categoryRef.current = arr[0];
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(queryString);
    }, 300);

    return () => clearTimeout(timer);
  }, [queryString]);
  const handleFilterData = () => {
    setCurrentPage(1);
    setCategory(categoryRef.current);
  };

  const handleExportData = () => {
    setGoExport(true);
  };

  React.useEffect(() => {
    if (ExportProductsData && goExport) {
      const columns = [
        'Kode Barang',
        'Nama Barang',
        'Harga Jual',
        'HPP',
        'Satuan',
        'Kategori',
        'Stok Minimum',
        'Tanggal Update',
      ];

      const tmpData = ExportProductsData?.data?.data?.map((item) => {
        return [
          item.product_code,
          item?.name,
          item?.price,
          item?.price_cogs,
          item?.unit,
          item?.category_name,
          item?.minimum_stock,
          format(item?.updated_at, 'dd-MMM-yyyy HH:mm:ss', { locale: id }),
        ];
      });

      if (tmpData) {
        tmpData?.unshift(columns);
        const kini = format(new Date(), 'dd-MMM-yyyy-HHmm', { locale: id });
        exportToCsv(`export-daftar-barang-${kini}.csv`, tmpData);
      } else {
        toast('tidak ada data');
      }

      setGoExport(false);
    }
  }, [ExportProductsData, goExport]);

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
            <div className='basis-80 text-xl font-bold'>Master Item</div>
            <div className='flex flex-1 basis-80 flex-wrap items-center justify-end md:gap-2'>
              <Button variant='default' onClick={startInputHandler}>
                <CirclePlusIcon />
                Tambah
              </Button>
            </div>
          </div>
          <div className='border-border relative mt-2 flex flex-wrap items-center justify-start gap-2 rounded-xs border p-4'>
            <span className='bg-sidebar border-border absolute top-0 -translate-y-1/2 rounded-full px-6 text-xs dark:border'>
              Filter
            </span>
            <div className='flex flex-col gap-0'>
              <label className='text-xs lg:text-sm'>Cari Item:</label>
              <Input
                className='lg:w-80'
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
                  <Button
                    onClick={handleFilterData}
                    variant='default'
                    disabled={isFetching}
                  >
                    <Search />
                    Filter
                  </Button>
                  <Button
                    onClick={handleExportData}
                    variant='ghost'
                    disabled={ExportIsFetching}
                  >
                    {ExportIsFetching ? (
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
            data={productsData ? productsData?.data?.data : []}
            numberOfPages={productsData ? productsData?.data?.last_page : 0}
            onPageChange={handlePageChange}
            isLoading={isFetching}
            searchValue={queryString}
            onSearchChange={handleSearchChange}
            initPageSize={pageSize}
            onPageSizeChange={setPageSize}
            currentPage={currentPage - 1}
          />
          <AddProductDialog
            open={showCreateFormDialog}
            onOpenChange={handleCreateOpenChange}
            onSuccess={onSuccessHandler}
            queryKey={queryKey}
          />
          <EditProductDialog
            open={showEditFormDialog}
            onOpenChange={handleEditOpenChange}
            onSuccess={onSuccessHandler}
            dataId={selectedId || ''}
            queryKey={queryKey}
          />
          <MyConfirmationDialog
            title='Hapus Barang'
            description='Anda yakin ingin menghapus barang ini?'
            onConfirm={() =>
              selectedId !== null && confirmDeleteHandler(selectedId)
            }
            onCancel={() => setSelectedId(null)}
            open={showDeleteDialog}
            onOpenChange={setShowDeleteDialog}
            dataId={selectedId || 0}
            showLoader={isDeletePending}
          />{' '}
        </div>
      </div>
    </div>
  );
};

export default ProductInventories;
