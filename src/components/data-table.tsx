'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  SortingState,
  getSortedRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  VisibilityState,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Input } from '@/components/ui/input';
import { DataTablePagination } from '@/components/data-table-pagination';
import { DataTableViewOptions } from '@/components/data-table-view-options';

import * as React from 'react';
import { BeatLoader } from 'react-spinners';
import { cn } from '@/lib/utils';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  numberOfPages: number;
  isLoading: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  initPageSize: number;
  onPageSizeChange: (pageSize: number) => void;
  showInputFilter?: boolean;
  showColumnVisibility?: boolean;
  currentPage: number;
  onPageChange?: (page: number) => void;
  children?: React.ReactNode;
  viewOptions?: {
    showInputFilter?: boolean;
    showColumnVisibility?: boolean;
    showPagination?: boolean;
  };
}

export function DataTable<TData, TValue>({
  columns,
  data,
  numberOfPages,
  onPageChange,
  isLoading,
  searchValue,
  onSearchChange,
  initPageSize,
  onPageSizeChange,
  currentPage,
  children,
  viewOptions = {
    showInputFilter: false,
    showColumnVisibility: false,
    showPagination: true,
  },
}: DataTableProps<TData, TValue>) {
  const [pagination, setPagination] = React.useState({
    pageIndex: currentPage || 0,
    pageSize: initPageSize,
  });

  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [rowSelection, setRowSelection] = React.useState({});
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    manualPagination: true,
    pageCount: numberOfPages,
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === 'function' ? updater(pagination) : updater;
      setPagination(newState);
      onPageChange?.(newState.pageIndex + 1);
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
  });

  React.useEffect(() => {
    setPagination({
      pageIndex: currentPage,
      pageSize: pagination.pageSize,
    });
  }, [currentPage]);

  return (
    <div>
      <div
        className={cn(
          'flex items-center justify-between pb-4',
          !viewOptions?.showInputFilter && !viewOptions?.showColumnVisibility
            ? 'hidden'
            : ''
        )}
      >
        <Input
          placeholder='Cari...'
          value={searchValue}
          onChange={(event) => {
            setPagination({
              pageIndex: 0,
              pageSize: pagination.pageSize,
            });
            onSearchChange?.(event.target.value);
          }}
          className={cn(
            'max-w-sm',
            viewOptions?.showInputFilter ? '' : 'hidden'
          )}
          autoFocus
        />
        <div
          className={cn(
            'flex items-center justify-end space-x-2',
            viewOptions?.showColumnVisibility ? '' : 'hidden'
          )}
        >
          <DataTableViewOptions table={table} />
        </div>
      </div>
      <div className='w-full overflow-hidden rounded-md border'>
        <Table className='min-w-full overflow-x-auto'>
          <TableHeader className='bg-muted sticky top-0 z-10'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className='**:data-[slot=table-cell]:first:w-8'>
            {isLoading && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  <div className='flex items-center justify-center'>
                    <BeatLoader color='#9CA3AF' />
                  </div>
                </TableCell>
              </TableRow>
            )}

            {!isLoading && table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isLoading ? (
              ''
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className='h-24 text-center'
                >
                  tidak ada hasil
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          {children}
        </Table>
      </div>
      {viewOptions?.showPagination && (
        <div className='mt-2'>
          <DataTablePagination
            table={table}
            onPageSizeChange={onPageSizeChange}
          />
        </div>
      )}
    </div>
  );
}
