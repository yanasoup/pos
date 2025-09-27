'use client';

import { ColumnDef } from '@tanstack/react-table';
import { SquarePenIcon, Trash2Icon } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/data-table-column-header';

import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { PurchaseReportReturn } from '@/types/product';

import { Checkbox } from '@/components/ui/checkbox';
import { formatNumber } from '@/lib/utils';

export function getColumns(): ColumnDef<PurchaseReportReturn>[] {
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
      accessorKey: 'purchase_date',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Tanggal'
          className='justify-start'
        />
      ),

      cell: ({ row }) => {
        return (
          <div className='text-left font-medium'>
            {format(row.original.purchase_date, 'dd MMM yyyy', { locale: id })}
          </div>
        );
      },
    },

    {
      accessorKey: 'product_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Nama Item' />
      ),
    },
    {
      accessorKey: 'category_name',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Supplier'
          className='justify-center'
        />
      ),
    },
    {
      accessorKey: 'supplier_name',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Catatan'
          className='justify-center'
        />
      ),
    },
    {
      accessorKey: 'qty',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Total Qty'
          className='justify-center'
        />
      ),

      cell: ({ row }) => {
        const formatted = formatNumber(row.original.qty);
        return <div className='text-center font-medium'>{formatted}</div>;
      },
    },
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Harga'
          className='justify-end'
        />
      ),
      cell: ({ row }) => {
        const formatted = formatNumber(row.original.price);
        return <div className='text-right font-medium'>{formatted}</div>;
      },
    },
    {
      accessorKey: 'total_price',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Total Harga'
          className='justify-end'
        />
      ),

      cell: ({ row }) => {
        const formatted = formatNumber(row.original.qty * row.original.price);
        return <div className='text-right font-medium'>{formatted}</div>;
      },
    },
  ];
}
