'use client';

import { ChevronsUpDown } from 'lucide-react';
import * as React from 'react';
import { ControllerRenderProps, FieldValues, Path } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { cn } from '@/lib/utils';

const data = [
  {
    id: '=',
    name: 'tidak ada selisih',
  },
  {
    id: '<>',
    name: 'ada selisih',
  },
];
export function BalanceDiffCombobox<
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
                        currentValue === value ? '' : `${item.id}`
                      );
                      field?.onChange(item.name);
                    }}
                    className='flex items-center gap-2 text-left font-medium'
                  >
                    <span
                      className={cn(item.id === '=' ? '' : 'text-destructive')}
                    >
                      {item.name}
                    </span>
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

export default BalanceDiffCombobox;
