'use client';

import { ColumnDef } from '@tanstack/react-table';
import { SquarePenIcon, Trash2Icon, Check } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/data-table-column-header';

import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { DBUser } from '@/types/user';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

export function getColumns(
  onEdit?: (id: string) => void,
  onDelete?: (id: string) => void
): ColumnDef<DBUser>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Nama' />
      ),
      cell: ({ row }) => {
        return <div className='text-left'>{row.original.name}</div>;
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Email' />
      ),
      cell: ({ row }) => {
        return <div className='text-left'>{row.original.email}</div>;
      },
    },
    {
      accessorKey: 'role_name',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Peran' />
      ),
      cell: ({ row }) => {
        return <div className='text-left'>{row.original.role_name}</div>;
      },
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title='Dibuat'
          className='justify-start'
        />
      ),

      cell: ({ row }) => {
        const formatted = format(
          row.getValue('created_at'),
          'dd MMM yyyy HH:mm:ss',
          {
            locale: id,
          }
        );
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
                  onClick={() => onEdit?.(row.original.id.toString())}
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
                  onClick={() => onDelete?.(row.original.id.toString())}
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
