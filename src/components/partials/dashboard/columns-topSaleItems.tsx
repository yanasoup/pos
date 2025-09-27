'use client';

import { ColumnDef } from '@tanstack/react-table';
import { SquarePenIcon, Trash2Icon } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/data-table-column-header';

import { Button } from '@/components/ui/button';

import { Supplier } from '@/types/supplier';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { formatNumber } from '@/lib/utils';
import Image from 'next/image';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

type DataTopItem = {
  product_name: string;
  image_url: string;
  count: number;
  amount: number;
};

export function getTopItemsColumn(): ColumnDef<DataTopItem>[] {
  return [
    {
      id: 'image_url',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          className='text-xs lg:text-sm'
          title='Image'
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
      accessorKey: 'count',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Qty'
          className='justify-end'
        />
      ),

      cell: ({ row }) => {
        const formatted = formatNumber(row.original.count);
        return <div className='text-right'>{formatted}</div>;
      },
    },
    {
      accessorKey: 'amount',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Total Rp.'
          className='justify-end'
        />
      ),
      cell: ({ row }) => {
        const formatted = formatNumber(row.original.amount);
        return <div className='text-right'>{formatted}</div>;
      },
    },
  ];
}
