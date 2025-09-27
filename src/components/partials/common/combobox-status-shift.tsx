'use client';

import { ChevronsUpDown } from 'lucide-react';
import * as React from 'react';
import { ControllerRenderProps, FieldValues, Path } from 'react-hook-form';
import { useSelector } from 'react-redux';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { cn } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { useGetUsers } from '@/hooks/user/useGetUser';

const data = [
  {
    id: 'open',
    name: 'open',
  },
  {
    id: 'closed',
    name: 'closed',
  },
  {
    id: 'pending_close',
    name: 'pending_close',
  },
];
export function ShiftStatusCombobox<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
>({
  field,
  onSelectConfirm,
  className,
  defaultText = 'Semua',
}: {
  field?: ControllerRenderProps<TFieldValues, TName>;
  onSelectConfirm?: (item: string) => void;
  className?: string;
  selectedValue?: string;
  defaultText?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');

  const handleSelected = (produk: string) => {
    onSelectConfirm?.(produk);
    setOpen(false);
  };

  React.useEffect(() => {
    setValue(field?.value || '');
  }, [field?.value]);

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            className={cn('justify-between', className)}
          >
            {value
              ? data.find((item) => item.name === value)?.name
              : defaultText}
            <ChevronsUpDown className='opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn('p-0', className)}>
          <Command>
            <CommandList>
              <CommandGroup>
                {data.map((item) => (
                  <CommandItem
                    key={item.id}
                    value={item.name}
                    onSelect={(currentValue) => {
                      setValue(currentValue === value ? '' : currentValue);
                      handleSelected(
                        currentValue === value ? '' : `${item.name}`
                      );
                      field?.onChange(item.name);
                    }}
                    className='flex items-center gap-2 text-left font-medium'
                  >
                    <span
                      className={cn(
                        'size-3 rounded-full',
                        item.name === 'open'
                          ? 'bg-green-300'
                          : item.name === 'closed'
                            ? 'bg-neutral-300'
                            : 'bg-orange-300'
                      )}
                    ></span>

                    {item.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}

export default ShiftStatusCombobox;
