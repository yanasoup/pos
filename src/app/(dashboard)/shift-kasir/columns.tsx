'use client';

import { ColumnDef } from '@tanstack/react-table';
import { SquarePenIcon } from 'lucide-react';
import { Icon } from '@iconify-icon/react';
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

import { ShiftKasir } from '@/types/shift';
import { cn, formatNumber } from '@/lib/utils';

export function getColumns(
  onEdit: (id: string) => void,
  onDelete?: (id: string) => void
): ColumnDef<ShiftKasir>[] {
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
      accessorKey: 'shift_date',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Tanggal'
          className='justify-start'
        />
      ),

      cell: ({ row }) => {
        const formatted = format(row.getValue('shift_date'), 'dd MMM yyyy', {
          locale: id,
        });
        return <div className='text-left font-medium'>{formatted}</div>;
      },
    },
    {
      accessorKey: 'cashier_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Kasir' />
      ),
      cell: ({ row }) => {
        return <div className='text-left'>{row.original.cashier_name}</div>;
      },
    },
    {
      accessorKey: 'closing_status',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Status'
          className='justify-start'
        />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex items-center gap-2 text-left font-medium'>
            <span
              className={cn(
                'size-3 rounded-full',
                row.original.closing_status === 'open'
                  ? 'bg-green-300'
                  : row.original.closing_status === 'closed'
                    ? 'bg-neutral-300'
                    : 'bg-orange-300'
              )}
            ></span>
            {row.original.closing_status}
          </div>
        );
      },
    },
    {
      accessorKey: 'opening_balance',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Saldo Awal'
          className='justify-end'
        />
      ),
      cell: ({ row }) => {
        const formatted = formatNumber(Number(row.original.opening_balance));
        return <div className='text-right font-medium'>{formatted}</div>;
      },
    },
    {
      accessorKey: 'closing_balance',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Saldo Akhir'
          className='justify-end'
        />
      ),
      cell: ({ row }) => {
        const formatted = row.original.closing_balance
          ? formatNumber(Number(row.original.closing_balance))
          : '';
        return <div className='text-right font-medium'>{formatted}</div>;
      },
    },
    {
      accessorKey: 'system_balance',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Saldo Sistem'
          className='justify-end'
        />
      ),
      cell: ({ row }) => {
        const formatted = formatNumber(Number(row.original.system_balance));
        return <div className='text-right font-medium'>{formatted}</div>;
      },
    },
    {
      accessorKey: 'difference',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Selisih'
          className='justify-end'
        />
      ),
      cell: ({ row }) => {
        const formatted = formatNumber(Number(row.original.difference));
        return (
          <div
            className={cn(
              'text-right font-medium',
              row.original.difference > 0
                ? 'text-green-300'
                : row.original.difference < 0
                  ? 'text-destructive'
                  : ''
            )}
          >
            {formatted}
          </div>
        );
      },
    },

    {
      accessorKey: 'opened_at',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Buka'
          className='justify-start'
        />
      ),
      cell: ({ row }) => {
        const formatted = format(row.original.opened_at, 'HH:mm:ss', {
          locale: id,
        });
        return <div className='text-left font-medium'>{formatted}</div>;
      },
    },
    {
      accessorKey: 'closed_at',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Tutup'
          className='justify-start'
        />
      ),
      cell: ({ row }) => {
        const formatted = format(row.original.closed_at, 'HH:mm:ss', {
          locale: id,
        });
        return <div className='text-left font-medium'>{formatted}</div>;
      },
    },
    {
      accessorKey: 'closed_by',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Ditutup Oleh'
          className='justify-start'
        />
      ),
      cell: ({ row }) => {
        return (
          <div className='text-left font-medium'>{row.original.closed_by}</div>
        );
      },
    },

    {
      id: 'actions',
      cell: ({ row }) => {
        return (
          <div className='flex-center flex gap-2'>
            {row.original.closing_status !== 'closed' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='outline'
                    className='w-fit cursor-pointer rounded-lg p-1'
                    size='sm'
                    onClick={() => onEdit(row.original.id)}
                  >
                    <Icon
                      icon={'material-symbols:left-panel-close-sharp'}
                      className='flex-center size-3 lg:size-4'
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side='left'>Tutup Kasir</TooltipContent>
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];
}
