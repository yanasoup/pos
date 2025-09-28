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
import { SaleMasterReturn } from '@/types/product';

export function getColumns(
  onEdit: (id: string) => void,
  onDelete?: (id: string) => void
): ColumnDef<SaleMasterReturn>[] {
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
      accessorKey: 'sale_date',
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
            {format(row.original.sale_date, 'dd MMM yyyy', { locale: id })}
          </div>
        );
      },
    },

    {
      accessorKey: 'sale_no',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='No. Penjualan' />
      ),
    },
    {
      accessorKey: 'total_qty',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Total Qty'
          className='justify-center'
        />
      ),

      cell: ({ row }) => {
        const formatted = formatNumber(row.original.total_qty);
        return <div className='text-center font-medium'>{formatted}</div>;
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
        const formatted = formatNumber(row.original.total_price);
        return <div className='text-right font-medium'>{formatted}</div>;
      },
    },
    {
      accessorKey: 'invoice_discount',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Diskon'
          className='justify-end'
        />
      ),
      cell: ({ row }) => {
        const formatted = formatNumber(row.original.invoice_discount || 0);
        return <div className='text-right font-medium'>{formatted}</div>;
      },
    },
    {
      id: 'net_margin',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Net. Margin'
          className='justify-end'
        />
      ),
      cell: ({ row }) => {
        const net_margin =
          (row.original.gross_margin || 0) -
          (row.original.invoice_discount || 0);
        const formatted = formatNumber(net_margin);
        return <div className='text-right font-medium'>{formatted}</div>;
      },
    },
    {
      accessorKey: 'cashier_name',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Kasir'
          className='justify-left'
        />
      ),

      cell: ({ row }) => {
        return (
          <div className='text-left font-medium'>
            {row.original.cashier_name}
          </div>
        );
      },
    },
    {
      accessorKey: 'updated_at',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Tgl. Input'
          className='justify-center'
        />
      ),

      cell: ({ row }) => {
        const formatted = format(row.original.updated_at, 'dd MMM yyyy HH:mm', {
          locale: id,
        });
        return <div className='text-center font-medium'>{formatted}</div>;
      },
    },

    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <div className='flex-center flex gap-2'>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='outline'
                  className='w-fit cursor-pointer rounded-lg p-1'
                  size='sm'
                  onClick={() => onEdit(row.original.id)}
                >
                  <PackageSearchIcon className='size-3 lg:size-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent side='left'>Lihat Daftar Barang</TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
  ];
}
