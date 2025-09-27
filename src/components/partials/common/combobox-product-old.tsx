'use client';

import { ChevronsUpDown } from 'lucide-react';
import * as React from 'react';
import { useSelector } from 'react-redux';

import { Button } from '@/components/ui/button';
import {
  Command,
  CommandDialog,
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
interface DialogProps extends React.ComponentProps<typeof CommandDialog> {
  onSelectConfirm?: (item: string) => void;
  className?: string;
}
const ProductComboboxOld: React.FC<DialogProps> = ({
  onSelectConfirm,
  className,
  ...props
}) => {
  const uiuxState = useSelector((state: RootState) => state.uiux);
  const [queryString, setQueryString] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');
  // const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState('');

  const handleSelected = (produk: string) => {
    onSelectConfirm?.(produk);
    props?.onOpenChange?.(false);
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

  return (
    <>
      <Popover {...props}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={props.open}
            className={cn('justify-between', className)}
          >
            {value
              ? productsData?.data.data.find(
                  (product) => product.name === value
                )?.name
              : 'Pilih Produk...'}
            <ChevronsUpDown className='opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn('p-0', className)}>
          <Command>
            <CommandInput
              placeholder='masukkan nama produk...'
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
                        // setQueryString('');
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
};

export default ProductComboboxOld;
