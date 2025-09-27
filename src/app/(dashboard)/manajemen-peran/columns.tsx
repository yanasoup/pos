'use client';

import { ColumnDef } from '@tanstack/react-table';
import { SquarePenIcon, Trash2Icon, Check } from 'lucide-react';
import { DataTableColumnHeader } from '@/components/data-table-column-header';

import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import { Role } from '@/types/role';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';

import { Checkbox } from '@/components/ui/checkbox';

export function getColumns(
  onEdit?: (id: string) => void,
  onDelete?: (id: string) => void
): ColumnDef<Role>[] {
  return [
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
      accessorKey: 'granted_menus',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Menu Akses' />
      ),
      cell: ({ row }) => {
        const menus = JSON.parse(row.original.granted_menus);
        return (
          <div className='grid grid-cols-1 gap-2 text-left md:grid-cols-3'>
            {menus.sort().map((menu: string, index: number) => (
              <div className='flex items-center gap-1' key={index}>
                <Check className='size-4 text-[green]' />
                <span>{menu}</span>
              </div>
            ))}
          </div>
        );
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
                  onClick={() => onEdit?.(row.original.id)}
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
                  onClick={() => onDelete?.(row.original.id)}
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
