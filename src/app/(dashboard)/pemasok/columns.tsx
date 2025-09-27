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

import { Checkbox } from '@/components/ui/checkbox';

export function getColumns(
  onEdit: (id: string) => void,
  onDelete: (id: string) => void
): ColumnDef<Supplier>[] {
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
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Nama' />
      ),
      cell: ({ row }) => {
        return <div className='text-left'>{row.getValue('name')}</div>;
      },
    },
    {
      accessorKey: 'address',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Alamat'
          className='justify-start'
        />
      ),

      cell: ({ row }) => {
        return (
          <div className='text-left font-medium'>{row.getValue('address')}</div>
        );
      },
    },
    {
      accessorKey: 'contact_person',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Nama Kontak'
          className='justify-start'
        />
      ),

      cell: ({ row }) => {
        return (
          <div className='text-left font-medium'>
            {row.getValue('contact_person')}
          </div>
        );
      },
    },
    {
      accessorKey: 'phone',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Np. Telepon'
          className='justify-start'
        />
      ),

      cell: ({ row }) => {
        return (
          <div className='text-left font-medium'>{row.getValue('phone')}</div>
        );
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Email'
          className='justify-start'
        />
      ),

      cell: ({ row }) => {
        return (
          <div className='text-left font-medium'>{row.getValue('email')}</div>
        );
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
