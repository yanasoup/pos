'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table-column-header';

import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { Checkbox } from '@/components/ui/checkbox';
import { formatNumber } from '@/lib/utils';
import { SaleReportReturn } from '@/types/product';

export function getColumns(): ColumnDef<SaleReportReturn>[] {
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
          title='Waktu'
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
      accessorKey: 'product_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Item' />
      ),
    },
    {
      accessorKey: 'category_name',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Kategori'
          className='justify-start'
        />
      ),
    },
    {
      accessorKey: 'qty',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Qty'
          className='justify-center'
        />
      ),
      cell: ({ row }) => {
        const formatted = formatNumber(row.original.qty);
        return <div className='text-center font-medium'>{formatted}</div>;
      },
    },
    {
      accessorKey: 'price_cogs',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='HPP'
          className='justify-end'
        />
      ),
      cell: ({ row }) => {
        const formatted = formatNumber(row.original.price_cogs || 0);
        return <div className='text-right font-medium'>{formatted}</div>;
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
        const formatted = formatNumber(row.original.price_cogs || 0);
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
        const net_margin = (row.original.price || 0) * (row.original.qty || 0);
        const formatted = formatNumber(net_margin);
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
        const formatted = formatNumber(row.original.invoice_discount);
        return <div className='text-right font-medium'>{formatted}</div>;
      },
    },
    {
      accessorKey: 'net_margin',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Margin'
          className='justify-end'
        />
      ),
      cell: ({ row }) => {
        const net_margin =
          row.original.price * row.original.qty -
          row.original.price_cogs * row.original.qty -
          row.original.invoice_discount;
        const formatted = formatNumber(net_margin);
        return <div className='text-right font-medium'>{formatted}</div>;
      },
    },
  ];
}
