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

import { useGetProducts } from '@/hooks/product/useGetProduct';
import { cn } from '@/lib/utils';
import { RootState } from '@/redux/store';
// interface DialogProps extends React.ComponentProps<typeof CommandDialog> {
//   onSelectConfirm?: (item: string) => void;
//   className?: string;
// }
// const ProductCombobox: React.FC<DialogProps> = ({
//   onSelectConfirm,
//   className,
//   ...props
// }) => {
export function ProductCombobox<
  TFieldValues extends FieldValues,
  TName extends Path<TFieldValues>,
>({
  field,
  onSelectConfirm,
  className,
}: {
  field?: ControllerRenderProps<TFieldValues, TName>;
  onSelectConfirm?: (item: string) => void;
  className?: string;
  selectedValue?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const uiuxState = useSelector((state: RootState) => state.uiux);
  const [queryString, setQueryString] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
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

  const { data: productsData, isFetching } = useGetProducts([
    'product-inventories',
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
              ? productsData?.data.data.find(
                  (product) => product.name === value
                )?.name
              : 'Semua'}
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
              {productsData && (
                <CommandGroup
                  heading={
                    queryString.length > 0
                      ? `hasil pencarian : "${queryString}" - ${productsData.data.total} item`
                      : ''
                  }
                >
                  {productsData.data.data.map((item) => (
                    <CommandItem
                      key={item.product_code}
                      value={item.name}
                      onSelect={(currentValue) => {
                        setValue(currentValue === value ? '' : currentValue);
                        handleSelected(
                          currentValue === value
                            ? ''
                            : `${item.product_code}||${item.name}`
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

export default ProductCombobox;
