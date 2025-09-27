'use client';

import { ColumnDef } from '@tanstack/react-table';
import { SquarePenIcon, Trash2Icon } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/data-table-column-header';

import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { Product } from '@/types/product';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

import { Checkbox } from '@/components/ui/checkbox';
import { formatNumber } from '@/lib/utils';
import Image from 'next/image';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export function getColumns(
  onEdit: (id: string) => void,
  onDelete: (id: string) => void
): ColumnDef<Product>[] {
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
    /*{
      id: 'no',
      header: () => <div className='text-center'>No</div>,
      cell: ({ row }) => {
        return <div className='text-center'>{row.index + 1}</div>;
      },
    },*/
    {
      accessorKey: 'product_code',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Kode Item'
          className='justify-start'
        />
      ),

      cell: ({ row }) => {
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className='cursor-pointer underline'>
                {row.getValue('product_code')}
              </span>
            </TooltipTrigger>
            <TooltipContent side='right' className='max-w-40'>
              <Image
                src={
                  row.original.image_url
                    ? `${BASE_URL}${row.original.image_url}`
                    : `https://placehold.co/400x300?text=cover`
                }
                alt={row.original.name.toLowerCase()}
                className='h-auto w-auto object-contain'
                width={200}
                height={152}
                priority={false}
                unoptimized={true}
              />
            </TooltipContent>
          </Tooltip>
        );
      },
    },

    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Nama' />
      ),
    },
    {
      accessorKey: 'price_cogs',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='HPP'
          className='justify-center'
        />
      ),

      cell: ({ row }) => {
        const formatted = formatNumber(row.original.price_cogs);
        return <div className='text-center font-medium'>{formatted}</div>;
      },
    },
    {
      accessorKey: 'price',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Harga Jual'
          className='justify-center'
        />
      ),

      cell: ({ row }) => {
        const formatted = formatNumber(row.original.price);
        return <div className='text-center font-medium'>{formatted}</div>;
      },
    },
    {
      accessorKey: 'unit',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Satuan'
          className='justify-start'
        />
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
      accessorKey: 'minimum_stock',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Stok Min.'
          className='justify-center'
        />
      ),
      cell: ({ row }) => {
        const formatted = formatNumber(row.original.minimum_stock);
        return <div className='text-center font-medium'>{formatted}</div>;
      },
    },
    {
      accessorKey: 'updated_at',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Diupdate'
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
