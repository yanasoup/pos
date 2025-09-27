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

import { useGetProductCategories } from '@/hooks/product-category/useGetProductCategory';
import { cn } from '@/lib/utils';
import { RootState } from '@/redux/store';
export function CategoryCombobox<
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
  const uiuxState = useSelector((state: RootState) => state.uiux);
  const [queryString, setQueryString] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  // const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');

  const handleSelected = (produk: string) => {
    onSelectConfirm?.(produk);
    setOpen(false);
  };

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(queryString);
    }, 300);

    return () => clearTimeout(timer);
  }, [queryString]);

  const { data, isFetching } = useGetProductCategories([
    'product-categories',
    {
      limit: 50,
      page: 1,
      queryString: debouncedSearch.length > 1 ? debouncedSearch : '',
    },
    uiuxState.apiToken!,
  ]);
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
              ? data?.data.data.find((item) => item.name === value)?.name
              : defaultText}
            <ChevronsUpDown className='opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn('p-0', className)}>
          <Command>
            <CommandInput
              placeholder='cari...'
              onValueChange={setQueryString}
            />
            <CommandList>
              <CommandEmpty>
                {isFetching ? 'Loading...' : 'data tidak ditemukan.'}
              </CommandEmpty>
              {data && (
                <CommandGroup
                  heading={
                    queryString.length > 0
                      ? `hasil pencarian : "${queryString}" - ${data.data.total} item`
                      : ''
                  }
                >
                  {data.data.data.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={item.name}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? '' : currentValue);
                        handleSelected(
                          currentValue === value
                            ? ''
                            : `${item.id}||${item.name}`
                        );
                        field?.onChange(item.name);
                      }}
                    >
                      {item.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}

export default CategoryCombobox;
