'use client';

import { ColumnDef } from '@tanstack/react-table';
import { PackageSearchIcon, SquarePenIcon, Trash2Icon } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/data-table-column-header';

import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

import { Checkbox } from '@/components/ui/checkbox';
import { formatNumber } from '@/lib/utils';
import { StockProduct } from '@/types/product';

export function getColumns(
  onEdit?: (id: string) => void,
  onDelete?: (id: string) => void
): ColumnDef<StockProduct>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <div className='text-center'>
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label='Select all'
          />
        </div>
      ),
      cell: ({ row }) => (
        <div className='text-center'>
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label='Select row'
          />
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'product_code',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Kode Item'
          className='justify-start'
        />
      ),
    },
    {
      accessorKey: 'product_name',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Nama Item'
          className='justify-start'
        />
      ),
    },

    {
      accessorKey: 'current_balance',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Stok'
          className='justify-center'
        />
      ),

      cell: ({ row }) => {
        const formatted = formatNumber(row.original.current_balance);
        return <div className='text-center font-medium'>{formatted}</div>;
      },
    },
    {
      accessorKey: 'unit',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Satuan'
          className='justify-center'
        />
      ),
      cell: ({ row }) => {
        return (
          <div className='text-center font-medium'>{row.original.unit}</div>
        );
      },
    },
    {
      accessorKey: 'category_name',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Kategori'
          className='justify-center'
        />
      ),
      cell: ({ row }) => {
        return (
          <div className='text-center font-medium'>
            {row.original.category_name}
          </div>
        );
      },
    },
  ];
}
