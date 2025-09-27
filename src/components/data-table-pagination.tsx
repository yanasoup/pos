import { Table } from '@tanstack/react-table';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  onPageSizeChange: (pageSize: number) => void;
}

export function DataTablePagination<TData>({
  table,
  onPageSizeChange,
}: DataTablePaginationProps<TData>) {
  return (
    <div className='flex flex-col items-center justify-between px-2 lg:flex-row'>
      <div className='text-muted-foreground flex-1 text-sm'>
        {table.getFilteredSelectedRowModel().rows.length} dari{' '}
        {table.getFilteredRowModel().rows.length} baris terpilih.
      </div>
      <div className='flex flex-row items-center space-x-6 md:flex-row lg:space-x-8'>
        <div className='flex items-center space-x-2'>
          <p className='text-sm font-medium'>baris per hal</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => {
              table.setPageSize(Number(value));
              onPageSizeChange(Number(value));
            }}
          >
            <SelectTrigger className='h-8 w-[70px]'>
              <SelectValue placeholder={table.getState().pagination.pageSize} />
            </SelectTrigger>
            <SelectContent side='top'>
              {[10, 20, 25, 30, 40, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className='flex items-center justify-center space-x-2'>
          <div className='flex min-w-[100px] items-center justify-center text-sm font-medium'>
            Hal {table.getState().pagination.pageIndex + 1} dari{' '}
            {table.getPageCount()}
          </div>
          <div className='flex items-center justify-center space-x-2'>
            <Button
              variant='outline'
              size='icon'
              className='hidden size-8 lg:flex'
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className='sr-only'>Go to first page</span>
              <ChevronsLeft />
            </Button>
            <Button
              variant='outline'
              size='icon'
              className='size-8'
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className='sr-only'>Go to previous page</span>
              <ChevronLeft />
            </Button>
            <Button
              variant='outline'
              size='icon'
              className='size-8'
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className='sr-only'>Go to next page</span>
              <ChevronRight />
            </Button>
            <Button
              variant='outline'
              size='icon'
              className='hidden size-8 lg:flex'
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className='sr-only'>Go to last page</span>
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
