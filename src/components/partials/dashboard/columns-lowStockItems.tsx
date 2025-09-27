'use client';

import { ColumnDef } from '@tanstack/react-table';
import { DataTableColumnHeader } from '@/components/data-table-column-header';

import { formatNumber } from '@/lib/utils';
import Image from 'next/image';
import { DataStock } from '@/hooks/summary/useGetSummary';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export function getLowStockItemsColumn(): ColumnDef<DataStock>[] {
  return [
    {
      id: 'image_url',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Image'
          className='text-xs lg:text-sm'
        />
      ),
      cell: ({ row }) => {
        return (
          <div className='flex items-center justify-center rounded-md bg-white'>
            <Image
              alt='img'
              src={
                row.original.image_url
                  ? `${BASE_URL}${row.original.image_url}`
                  : `https://placehold.co/400x300?text=cover`
              }
              width={200}
              height={200}
              priority={false}
              unoptimized={true}
              className='size-10 object-contain'
            />
          </div>
        );
      },
    },

    {
      accessorKey: 'product_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Item' />
      ),
      cell: ({ row }) => {
        return <div className='text-left'>{row.original.product_name}</div>;
      },
    },

    {
      accessorKey: 'stok',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Stok'
          className='justify-end'
        />
      ),
      cell: ({ row }) => {
        const formatted = formatNumber(row.original.stok);
        return <div className='text-right font-medium'>{formatted}</div>;
      },
    },
  ];
}
