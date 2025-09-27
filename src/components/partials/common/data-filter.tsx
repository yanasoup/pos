import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { ChevronDownIcon, Download, Search } from 'lucide-react';
import React from 'react';
import { BeatLoader } from 'react-spinners';

import ProductCombobox from '@/components/partials/common/combobox-product';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { cn } from '@/lib/utils';

import CategoryCombobox from './combobox-category';
import SupplierCombobox from './combobox-supplier';

export type FilterParams = {
  dateFrom: string | undefined;
  dateTo: string | undefined;
  productCode: string | undefined;
  categoryId: string | undefined;
  supplierId: string | undefined;
};
type FilterProps = {
  isLoading: boolean;
  onFilter: (params: FilterParams) => void;
  options?: {
    showProductFilter?: boolean;
    showCategoryFilter?: boolean;
    showExportButton?: boolean;
  };
  onExport?: () => void;
  isExporting?: boolean;
  initDateFrom?: Date;
  initDateTo?: Date;
  children?: React.ReactNode;
};
const DateFilter: React.FC<FilterProps> = ({
  onFilter,
  isLoading = false,
  options = { showProductFilter: false, showCategoryFilter: false },
  onExport,
  isExporting,
  initDateFrom,
  initDateTo,
  children,
}) => {
  const [openDf, setOpenDf] = React.useState(false);
  const [openDt, setOpenDt] = React.useState(false);
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = React.useState<Date | undefined>(undefined);
  const [selectedItem, setSelectedItem] = React.useState<string | undefined>(
    undefined
  );
  const [selectedCategory, setSelectedCategory] = React.useState<
    string | undefined
  >(undefined);
  const [selectedSupplier, setSelectedSupplier] = React.useState<
    string | undefined
  >(undefined);

  const handleConfirmSelect = (item: string) => {
    const arrItem = item.split('||');
    setSelectedItem(arrItem?.[0] || '');
  };
  const confirmSelectCategory = (category: string) => {
    const arr = category.split('||');
    setSelectedCategory(arr[0]);
  };
  const confirmSelectSupplier = (selected: string) => {
    const arr = selected.split('||');
    setSelectedSupplier(arr[0]);
  };

  const handleSubmit = () => {
    const params: FilterParams = {
      dateFrom: dateFrom ? format(dateFrom, 'yyyy-MM-dd', { locale: id }) : '',
      dateTo: dateTo ? format(dateTo, 'yyyy-MM-dd', { locale: id }) : '',
      productCode: selectedItem,
      categoryId: selectedCategory,
      supplierId: selectedSupplier,
    };
    onFilter(params);
  };

  React.useEffect(() => {
    const dateNow = new Date();
    let df = parseISO(format(dateNow, 'yyyy-MM-dd', { locale: id }));
    if (initDateFrom) {
      df = parseISO(format(initDateFrom, 'yyyy-MM-dd', { locale: id }));
    }
    let dt = parseISO(
      format(dateNow, 'yyyy-MM-dd', {
        locale: id,
      })
    );
    if (initDateTo) {
      dt = parseISO(format(initDateTo, 'yyyy-MM-dd', { locale: id }));
    }

    setDateFrom(df);
    setDateTo(dt);
  }, []);

  const handleExportData = () => {
    onExport?.();
  };

  return (
    <div className='border-border relative mt-4 flex flex-col flex-wrap items-center justify-start gap-2 rounded-xs border p-4 md:mt-2 lg:flex-row'>
      <span className='bg-sidebar border-border absolute top-0 -translate-y-1/2 rounded-full px-6 text-xs dark:border'>
        Filter
      </span>
      <div className='flex flex-col'>
        <Label htmlFor='date_from' className='text-xs lg:text-sm'>
          Tanggal:
        </Label>
        <div className='flex flex-col items-center justify-start gap-2 md:flex-row'>
          <Popover open={openDf} onOpenChange={setOpenDf}>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                id='date_from'
                className='w-38 justify-between font-normal'
              >
                {dateFrom
                  ? format(dateFrom, 'dd MMM yyyy', { locale: id })
                  : 'dari'}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className='w-auto overflow-hidden p-0'
              align='start'
            >
              <Calendar
                mode='single'
                selected={dateFrom}
                captionLayout='dropdown'
                onSelect={(date) => {
                  setDateFrom(date);
                  setOpenDf(false);
                }}
              />
            </PopoverContent>
          </Popover>
          <span className='text-xs lg:text-sm'>s/d</span>
          <Popover open={openDt} onOpenChange={setOpenDt}>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                id='date_to'
                className='w-38 justify-between font-normal'
              >
                {dateTo
                  ? format(dateTo, 'dd MMM yyyy', { locale: id })
                  : 'sampai'}
                <ChevronDownIcon />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className='w-auto overflow-hidden p-0'
              align='start'
            >
              <Calendar
                mode='single'
                selected={dateTo}
                captionLayout='dropdown'
                onSelect={(date) => {
                  setDateTo(date);
                  setOpenDt(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div
        className={cn(
          'flex flex-col',
          options.showProductFilter ? '' : 'hidden'
        )}
      >
        <Label htmlFor='product_name' className='text-xs lg:text-sm'>
          Item
        </Label>
        <ProductCombobox
          onSelectConfirm={handleConfirmSelect}
          className='min-w-50'
        />
      </div>
      <div
        className={cn(
          'flex flex-col',
          options.showCategoryFilter ? '' : 'hidden'
        )}
      >
        <Label className='text-xs lg:text-sm'>Kategori</Label>
        <CategoryCombobox
          className='md:min-w-50'
          defaultText='Semua'
          onSelectConfirm={(value) => confirmSelectCategory(value)}
        />
      </div>
      <div
        className={cn(
          'flex flex-col',
          options.showCategoryFilter ? '' : 'hidden'
        )}
      >
        <Label className='text-xs lg:text-sm'>Supplier</Label>
        <SupplierCombobox
          className='md:min-w-50'
          defaultText='Semua'
          onSelectConfirm={(value) => confirmSelectSupplier(value)}
        />
      </div>
      {children}
      <div className='flex flex-col items-end'>
        <Label className='text-xs lg:text-sm'>&nbsp;</Label>
        <div className='flex flex-col gap-2 lg:flex-row'>
          <Button variant='default' onClick={handleSubmit} disabled={isLoading}>
            <Search />
            {isLoading ? <BeatLoader size={10} /> : 'Filter'}
          </Button>

          {options.showExportButton && (
            <Button
              onClick={handleExportData}
              variant='ghost'
              disabled={isExporting}
              // className='hover:bg-neutral-25 mt-1 flex gap-1 bg-neutral-100 py-1 text-xs max-sm:flex-1 md:w-fit lg:mt-0 lg:text-sm'
            >
              {isExporting ? (
                <BeatLoader />
              ) : (
                <>
                  <Download />
                  Download CSV
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateFilter;
