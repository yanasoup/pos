'use client';

import { Search } from 'lucide-react';
import * as React from 'react';
import { useSelector } from 'react-redux';

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';

import { useGetProducts } from '@/hooks/product/useGetProduct';
import { RootState } from '@/redux/store';

interface DialogProps extends React.ComponentProps<typeof CommandDialog> {
  onSelectConfirm?: (item: string) => void;
}
const SearchProductDialog: React.FC<DialogProps> = ({
  onSelectConfirm,
  ...props
}) => {
  const uiuxState = useSelector((state: RootState) => state.uiux);
  const [queryString, setQueryString] = React.useState('');
  const [debouncedSearch, setDebouncedSearch] = React.useState('');

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
      limit: 100,
      page: 1,
      queryString: debouncedSearch.length > 3 ? debouncedSearch : '',
      categoryId: '',
    },
    uiuxState.apiToken!,
  ]);

  return (
    <>
      <CommandDialog
        {...props}
        className='w-[90%] max-w-[90%] md:w-[75%] lg:w-[50%]'
      >
        <CommandInput
          placeholder='cari barang...'
          onValueChange={setQueryString}
        />
        <CommandList>
          <CommandEmpty>
            {isFetching ? 'Loading...' : 'data tidak ditemukan.'}
          </CommandEmpty>

          <CommandGroup
            heading={
              queryString.length === 0
                ? 'Daftar Barang'
                : `hasil pencarian : "${queryString}" - ${productsData?.data.total} item`
            }
          >
            {isFetching && (
              <CommandItem>
                <Search />
                <span>Loading...</span>
              </CommandItem>
            )}
            {productsData &&
              productsData.data.data.map((item) => (
                <CommandItem
                  key={`${item.product_code}||${item.name}`}
                  onSelect={() =>
                    handleSelected(`${item.product_code}||${item.name}`)
                  }
                >
                  {`${item.name} - ${item.product_code} - ${item.price}`}
                </CommandItem>
              ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default SearchProductDialog;
