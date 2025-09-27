'use client';

import { ColumnDef } from '@tanstack/react-table';
import { SquarePenIcon, Trash2Icon } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/data-table-column-header';

import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { PurchaseMasterReturn } from '@/types/product';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

import { Checkbox } from '@/components/ui/checkbox';
import { formatNumber } from '@/lib/utils';

export function getColumns(
  onEdit: (id: string) => void,
  onDelete: (id: string) => void
): ColumnDef<PurchaseMasterReturn>[] {
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
      id: 'no',
      header: () => <div className='text-center'>No</div>,
      cell: ({ row }) => {
        return <div className='text-center'>{row.index + 1}</div>;
      },
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
      accessorKey: 'purchase_no',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='No. Pembelian' />
      ),
    },
    {
      accessorKey: 'supplier_name',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Supplier'
          className='justify-center'
        />
      ),
    },
    {
      accessorKey: 'notes',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Catatan'
          className='justify-center'
        />
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
          className='justify-start'
        />
      ),
      cell: ({ row }) => {
        const formatted = formatNumber(row.original.total_price);
        return <div className='text-right font-medium'>{formatted}</div>;
      },
    },
    {
      accessorKey: 'updated_at',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Tgl. Input'
          className='justify-start'
        />
      ),

      cell: ({ row }) => {
        const formatted = format(row.original.updated_at, 'dd MMM yyyy HH:mm', {
          locale: id,
        });
        return <div className='text-left font-medium'>{formatted}</div>;
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
                  <SquarePenIcon className='size-3 lg:size-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent side='left'>Edit</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='destructive'
                  className='w-fit cursor-pointer rounded-lg p-1'
                  size='sm'
                  onClick={() => onDelete(row.original.id)}
                >
                  <Trash2Icon className='size-3 lg:size-4' />
                </Button>
              </TooltipTrigger>
              <TooltipContent side='right'>Hapus</TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
  ];
}
