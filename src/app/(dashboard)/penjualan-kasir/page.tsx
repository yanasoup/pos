'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { Trash2Icon } from 'lucide-react';
import { SquarePenIcon } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { BeatLoader } from 'react-spinners';
import { toast } from 'sonner';
import z from 'zod';

import MyPaymentDialog from '@/components/partials/common/payment-dialog';
import type { FormData as PaymentDialogFormData } from '@/components/partials/common/payment-dialog';
import SearchProductDialog from '@/components/partials/common/search-product-dialog';
import HeaderNavigation from '@/components/partials/layouts/header-navigation';
import AddProductDialog from '@/components/partials/product/add-product';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import {
  useGetProductByCode,
  UseGetProductsParams,
} from '@/hooks/product/useGetProduct';
import {
  CreateSaleParams,
  useCreateTransaction,
} from '@/hooks/sale/useCreateTransaction';
import { cn, formatNumber, formatNumberFromString } from '@/lib/utils';
import { RootState } from '@/redux/store';
import {
  addToSaleCart,
  removeFromSaleCart,
  resetCart,
  SaleCartItem,
  updateSaleCart,
  setCashierStatus,
} from '@/redux/ui-slice';

import { useGetShiftKasir } from '@/hooks/shift-kasir/useGetShift';
import OpenCashierDialog from '@/components/partials/penjualan-kasir/open-cashier-dialog';

const formSchema = z.object({
  name: z.string().optional(),
  product_code: z.string().min(8, 'Masukan kode barang'),
  qty: z.string().min(1, 'qty harus lebih besar dari 0'),
  price: z.string().optional(),
});

export type FormData = z.infer<typeof formSchema>;
const PenjualanKasir = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      qty: '1',
      product_code: '',
      name: '',
      price: '',
    },
  });
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [showCreateFormDialog, setShowCreateFormDialog] = React.useState(false);
  const uiuxState = useSelector((state: RootState) => state.uiux);
  const inputRef = useRef<HTMLInputElement>(null);
  const dispatch = useDispatch();
  const {
    data: productByCodeData,
    mutate: getProductByCode,
    isPending: getProductByCodePending,
    error: productByCodeError,
  } = useGetProductByCode();
  const cartData = useSelector(
    (state: RootState) => state.uiux.saleCart.detail
  );

  const priceRef = React.useRef<HTMLInputElement>(null);
  const qtyRef = React.useRef<HTMLInputElement>(null);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const cashierStatus = useSelector(
    (state: RootState) => state.uiux.cashierStatus
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if ((e.target as HTMLInputElement).name === 'qty') {
        if (isEditMode) {
          form.setFocus('price');
          if (priceRef.current) {
            priceRef.current.focus();
            priceRef.current.select();
          }
        } else {
          form.setFocus('product_code');
          if (inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
          }
        }
      } else if (
        (e.target as HTMLInputElement).name === 'product_code' &&
        isEditMode
      ) {
        form.setFocus('price');
        if (priceRef.current) {
          priceRef.current.focus();
          priceRef.current.select();
        }
      } else if (
        (e.target as HTMLInputElement).name === 'price' &&
        isEditMode
      ) {
        const cartItem = uiuxState.saleCart.detail.find(
          (item) => item.product_id === selectedId
        ) as SaleCartItem;

        const newData: SaleCartItem = {
          product_id: cartItem.product_id || '',
          product_code: cartItem.product_code || '',
          product_name: cartItem.product_name,
          qty: Number(form.getValues('qty').replace(/\D/g, '')),
          price: Number(form.getValues('price')?.replace(/\D/g, '')),
          price_cogs:
            cartItem.price_cogs !== 0
              ? cartItem.price_cogs
              : Number(form.getValues('price')?.replace(/\D/g, '')),
        };
        dispatch(updateSaleCart(newData));

        setIsEditMode(false);

        form.reset();
        form.setValue('qty', '1');
        setTimeout(() => {
          form.setFocus('product_code');
          inputRef.current?.focus();
          inputRef.current?.select();
        }, 100);
      }
    }
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (e.target.name === 'price') {
      form.setValue('price', formatNumberFromString(rawValue));
    } else if (e.target.name === 'qty') {
      form.setValue('qty', formatNumberFromString(rawValue));
    }
  };

  const handleSubmit = (data: FormData) => {
    getProductByCode({
      productCode: data.product_code,
      requestToken: uiuxState.apiToken!,
    });
  };

  React.useEffect(() => {
    if (productByCodeData) {
      form.setValue('name', productByCodeData.name);
      form.setValue('price', formatNumber(productByCodeData.price));

      const newData: SaleCartItem = {
        product_id: productByCodeData?.id,
        product_code: productByCodeData?.product_code,
        product_name: productByCodeData?.name,
        qty: Number(form.getValues('qty')),
        price: productByCodeData?.price,
        price_cogs: productByCodeData?.price_cogs,
      };

      dispatch(addToSaleCart(newData));
      form.setValue('qty', '1');

      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  }, [productByCodeData, dispatch, form]);

  React.useEffect(() => {
    if (getProductByCodePending) {
      form.setValue('name', '');
    }
  }, [form, getProductByCodePending]);

  React.useEffect(() => {
    if (productByCodeError) {
      const axiosError = productByCodeError as AxiosError;
      toast.warning('Info', {
        description: `Produk tidak ditemukan. Pastikan kode barang benar. ${(axiosError?.response?.data as { message: string })?.message ?? 'unknown error'}`,
      });
      form.setFocus('product_code');
    }
  }, [productByCodeError, form]);

  const startDeleteHandler = (rowId: string) => {
    dispatch(removeFromSaleCart(rowId));
  };

  const [showShowConfirmDialog, setShowShowConfirmDialog] =
    React.useState(false);
  const [openSearchDialog, setOpenSearchDialog] = React.useState(false);
  const [showOpenCashierDialog, setShowOpenCashierDialog] =
    React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // if (e.key === 'b' && (e.metaKey || e.ctrlKey)) {
      if (e.key === 'F10' && uiuxState.cashierStatus === 'open') {
        e.preventDefault();
        setShowShowConfirmDialog(
          (showShowConfirmDialog) =>
            !showShowConfirmDialog && uiuxState.saleCart.detail.length > 0
        );
      } else if (
        (e.key === 'F1' && uiuxState.cashierStatus === 'open') ||
        (e.key === 'k' &&
          (e.metaKey || e.ctrlKey) &&
          uiuxState.cashierStatus === 'open')
      ) {
        e.preventDefault();
        setOpenSearchDialog((openSearchDialog) => !openSearchDialog);
      } else if (e.key === 'F3' && uiuxState.cashierStatus === 'open') {
        // if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowCreateFormDialog(
          (showCreateFormDialog) => !showCreateFormDialog
        );
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [uiuxState.saleCart.detail]);

  const handleConfirmSelect = (item: string) => {
    const arrItem = item.split('||');
    form.setValue('product_code', arrItem?.[0] || '');
    getProductByCode({
      productCode: arrItem?.[0],
      requestToken: uiuxState.apiToken!,
    });
  };

  const {
    mutate: createTransactionFn,
    isSuccess,
    error,
    isPending,
  } = useCreateTransaction();

  const handleCommitTransaction = (data: PaymentDialogFormData) => {
    const params: CreateSaleParams = {
      data: {
        sale_master: {
          shift_id: uiuxState.shiftId,
          sale_no: uiuxState.saleCart.master.sale_no,
          sale_date: uiuxState.saleCart.master.sale_date,
          customer: 'PELANGGAN UMUM',
          notes: '-',
          invoice_discount: Number(data.diskon_faktur.replace(/\D/g, '')),
        },
        detail: cartData,
      },
      requestToken: uiuxState.apiToken!,
    };
    createTransactionFn(params);
  };

  React.useEffect(() => {
    if (isSuccess) {
      toast.success('Sukses', { description: 'Transaksi berhasil disimpan' });
      form.reset();
      dispatch(resetCart());
      setShowShowConfirmDialog(false);
      const timerId = setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 100);

      return () => {
        clearTimeout(timerId);
      };
    }
  }, [isSuccess, form, dispatch]);

  React.useEffect(() => {
    if (error) {
      toast.error('Gagal', {
        description: 'Gagal menyimpan data. silahkan hubungi admin',
      });
    }
  }, [error]);

  /** product add dialog */
  const queryKey: UseGetProductsParams = useMemo(() => {
    return [
      'product-inventories',
      {
        limit: 100,
        page: 1,
        queryString: '',
        categoryId: '',
      },
      uiuxState.apiToken!,
    ];
  }, [uiuxState.apiToken]);

  const handleCreateOpenChange = (open: boolean) => {
    setShowCreateFormDialog(open);
  };

  const onSuccessHandler = useCallback(() => {
    setShowCreateFormDialog(false);
    setSelectedId(null);

    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const startEditHandler = (dataId: string) => {
    setIsEditMode(true);
    setSelectedId(dataId);
    const cartItem = uiuxState.saleCart.detail.find(
      (item) => item.product_id === dataId
    ) as SaleCartItem;

    form.setValue('product_code', cartItem.product_code);
    form.setValue('name', cartItem.product_name);
    form.setValue('qty', formatNumber(cartItem.qty));
    form.setValue('price', formatNumber(cartItem.price));
    form.setFocus('qty');
    setTimeout(() => {
      if (qtyRef.current) {
        qtyRef.current.focus();
        qtyRef.current.select();
      }
    }, 100);
  };

  const {
    data: dataShift,
    isPending: shiftLoading,
    mutate: getShiftFn,
  } = useGetShiftKasir();

  useEffect(() => {
    const kini = format(new Date(), 'yyyy-MM-dd', { locale: id });
    getShiftFn();
  }, []);

  useEffect(() => {
    if (dataShift) {
      const status = dataShift?.status;
      if (
        status === 'open' ||
        status === 'pending_close' ||
        status === 'closed'
      ) {
        dispatch(setCashierStatus(status));
      }
    }
  }, [dataShift?.status]);

  return (
    <div className='flex flex-1 flex-col'>
      <div className='@container/main flex flex-1 flex-col gap-2'>
        <div className='flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6'>
          <HeaderNavigation showMerchantName={true} />

          <div className='flex flex-col'>
            <div className='relative flex-2'>
              {shiftLoading && (
                <div className='bg-background flex-center absolute inset-0 flex h-full opacity-70'>
                  <BeatLoader color='#a3ced0' />
                </div>
              )}
              {uiuxState.cashierStatus !== 'open' && (
                <div className='bg-background flex-center absolute inset-0 z-10 flex h-full opacity-100'>
                  <p className=''>
                    <Button onClick={() => setShowOpenCashierDialog(true)}>
                      Buka Shift
                    </Button>
                  </p>
                </div>
              )}
              {/* {(dataShift?.data?.total || 0) > 0 && ( */}
              <>
                <div className='bg-muted flex-between flex min-w-80 rounded-tl-lg rounded-tr-lg border px-3 py-2 max-[400px]:flex-col'>
                  <p className='md:text-md text-sm'>Input Transaksi</p>
                  <div className='flex-end flex gap-2'>
                    <p className='flex-center flex flex-col text-xs md:flex-row'>
                      Cari Item :
                      <kbd className='text-md inline-flex h-5 items-center gap-1 rounded border-0 px-1.5 font-mono font-medium opacity-100 select-none'>
                        <span
                          className='text-md text-destructive hover:text-destructive/90 font-bold hover:cursor-pointer'
                          onClick={() => {
                            if (cashierStatus === 'open') {
                              setOpenSearchDialog(
                                (openSearchDialog) => !openSearchDialog
                              );
                            }
                          }}
                        >
                          F1
                        </span>
                      </kbd>
                    </p>
                    <p className='flex-center flex flex-col text-xs md:flex-row'>
                      Input Item :
                      <kbd className='text-md inline-flex h-5 items-center gap-1 rounded border-0 px-1.5 font-mono font-medium opacity-100 select-none'>
                        <span
                          className='text-md text-destructive hover:text-destructive/90 font-bold hover:cursor-pointer'
                          onClick={() => {
                            if (cashierStatus === 'open') {
                              setShowCreateFormDialog(
                                (showCreateFormDialog) => !showCreateFormDialog
                              );
                            }
                          }}
                        >
                          F3
                        </span>
                      </kbd>
                    </p>
                    <p className='flex-center flex flex-col text-xs md:flex-row'>
                      Bayar :
                      <kbd className='text-md inline-flex h-5 items-center gap-1 rounded border-0 px-1.5 font-mono font-medium opacity-100 select-none'>
                        <span
                          className='text-md text-destructive hover:text-destructive/90 font-bold hover:cursor-pointer'
                          onClick={() => {
                            if (cashierStatus === 'open') {
                              setShowShowConfirmDialog(
                                (showShowConfirmDialog) =>
                                  !showShowConfirmDialog &&
                                  uiuxState.saleCart.detail.length > 0
                              );
                            }
                          }}
                        >
                          F10
                        </span>
                      </kbd>
                    </p>
                  </div>
                </div>
                <div className='border border-t-0 p-4 pt-0'>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                      <div className='flex flex-col flex-wrap gap-1 md:flex-row md:gap-4'>
                        <FormField
                          control={form.control}
                          name='qty'
                          render={({ field }) => (
                            <FormItem className='mt-1 w-20 gap-0 md:mt-1'>
                              <FormLabel>Qty</FormLabel>
                              <Input
                                {...field}
                                name='qty'
                                className={cn(
                                  form.formState.errors?.qty
                                    ? 'border-destructive'
                                    : ''
                                )}
                                placeholder='Masukan kode item...'
                                disabled={false}
                                type='text'
                                autoComplete='off'
                                onKeyDown={handleKeyDown}
                                value={field.value ? field.value : ''}
                                onChange={handleNumberChange}
                                ref={qtyRef}
                              />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name='product_code'
                          render={({ field }) => (
                            <FormItem className='mt-1 min-w-50 flex-2 gap-0 md:mt-1'>
                              <FormLabel>Kode Item</FormLabel>
                              <Input
                                {...field}
                                className={cn(
                                  form.formState.errors?.product_code
                                    ? 'border-destructive'
                                    : ''
                                )}
                                placeholder='Masukan kode item...'
                                disabled={isEditMode}
                                type='text'
                                autoComplete='off'
                                // onKeyDown={handleKeyDown}
                                ref={inputRef}
                                autoFocus
                              />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name='name'
                          render={({ field }) => (
                            <FormItem className='mt-1 min-w-50 flex-4 gap-0 md:mt-1'>
                              <FormLabel>Nama Item</FormLabel>
                              <div className='relative'>
                                {getProductByCodePending && (
                                  <div className='absolute inset-0 flex items-center justify-start px-4'>
                                    <BeatLoader size={10} color='#a3ced0' />
                                  </div>
                                )}
                                <Input
                                  {...field}
                                  className={cn(
                                    form.formState.errors?.name
                                      ? 'border-destructive'
                                      : ''
                                  )}
                                  disabled={false}
                                  type='text'
                                  autoComplete='off'
                                  readOnly
                                />
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name='price'
                          render={({ field }) => (
                            <FormItem className='mt-1 min-w-50 flex-1 gap-0 md:mt-1'>
                              <FormLabel>Harga</FormLabel>
                              <div className='relative'>
                                {getProductByCodePending && (
                                  <div className='absolute inset-0 flex items-center justify-start px-4'>
                                    <BeatLoader size={10} />
                                  </div>
                                )}
                                <Input
                                  {...field}
                                  name='price'
                                  className={cn(
                                    isEditMode ? '' : 'bg-muted',
                                    form.formState.errors?.price
                                      ? 'border-destructive'
                                      : ''
                                  )}
                                  disabled={!isEditMode}
                                  type='text'
                                  autoComplete='off'
                                  onChange={handleNumberChange}
                                  value={field.value ? field.value : ''}
                                  onKeyDown={handleKeyDown}
                                  ref={priceRef}
                                />
                                <FormMessage className='text-xs' />
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className='mt-2 hidden flex-col items-center justify-end gap-2'>
                        <Button disabled={false} variant='default'>
                          Simpan
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              </>
              {/* )} */}
            </div>

            <div className='flex-3 pb-4'>
              <div className='flex-between mt-4 rounded-tl-lg rounded-tr-lg px-3 py-2'>
                <div className='lg:text-md flex flex-col text-sm md:flex-row'>
                  <span>Keranjang Belanja:&nbsp;</span>
                  <p className=''>
                    <span className='text-destructive'>
                      {formatNumber(cartData.length)}
                    </span>{' '}
                    item
                  </p>
                </div>
                <p className='lg:text-md text-sm'>
                  Total: Rp
                  <span className='text-destructive text-3xl font-bold'>
                    {formatNumber(
                      cartData.reduce(
                        (acc, item) => acc + item?.qty * item?.price,
                        0
                      )
                    )}
                  </span>
                </p>
              </div>
              <div className='overflow-x-auto'>
                <table className='min-w-full border-collapse overflow-auto border'>
                  <thead>
                    <tr className='bg-muted'>
                      <th className='font-regular sticky top-0 border p-2 text-center text-xs lg:text-sm'>
                        No.
                      </th>
                      <th className='font-regular sticky top-0 border p-2 text-left text-xs lg:text-sm'>
                        Item
                      </th>
                      <th className='font-regular sticky top-0 border p-2 text-center text-xs lg:text-sm'>
                        Qty
                      </th>
                      <th className='font-regular sticky top-0 border p-2 text-center text-xs lg:text-sm'>
                        Harga
                      </th>
                      <th className='font-regular sticky top-0 border p-2 text-center text-xs lg:text-sm'>
                        Total
                      </th>
                      <th className='font-regular sticky top-0 border p-2 text-center text-xs lg:text-sm'>
                        {' '}
                      </th>
                    </tr>
                  </thead>
                  <tbody className='min-h-20'>
                    {cartData.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className='border px-2 py-1 text-center text-xs lg:text-xs'
                        >
                          Keranjang masih kosong
                        </td>
                      </tr>
                    )}
                    {cartData.length > 0 &&
                      cartData.map((item, index) => (
                        <tr key={index}>
                          <td className='font-regular border px-2 py-1 text-center text-xs lg:text-sm'>
                            {index + 1}
                          </td>
                          <td className='font-regular border px-2 py-1 text-left text-xs lg:text-sm'>
                            {item?.product_name}
                          </td>
                          <td className='font-regular border px-2 py-1 text-center text-xs lg:text-sm'>
                            {formatNumber(item?.qty)}
                          </td>
                          <td className='font-regular border px-2 py-1 text-center text-xs lg:text-sm'>
                            {formatNumber(item?.price)}
                          </td>
                          <td className='font-regular border px-2 py-1 text-center text-xs lg:text-sm'>
                            {formatNumber(item?.qty * item?.price)}
                          </td>
                          <td className='font-regular border px-2 py-1 text-center text-xs lg:text-sm'>
                            <div className='flex-center gap-1'>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant='outline'
                                    size='sm'
                                    onClick={() =>
                                      startEditHandler(item.product_id)
                                    }
                                  >
                                    <SquarePenIcon size={12} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side='left'>
                                  Edit
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant='destructive'
                                    size='sm'
                                    onClick={() =>
                                      startDeleteHandler(item.product_id)
                                    }
                                  >
                                    <Trash2Icon size={12} />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side='right'>
                                  Hapus
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <MyPaymentDialog
            onConfirm={handleCommitTransaction}
            onCancel={() => {}}
            open={showShowConfirmDialog}
            onOpenChange={setShowShowConfirmDialog}
            showLoader={isPending}
            confirmBtnText='Bayar & Selesai'
            jumlahTagihan={cartData.reduce(
              (acc, item) => acc + item?.qty * item?.price,
              0
            )}
            isSaveSuccess={isSuccess}
          />
          <OpenCashierDialog
            onConfirm={() => {}}
            onCancel={() => {}}
            open={showOpenCashierDialog}
            onOpenChange={setShowOpenCashierDialog}
            confirmBtnText='Simpan'
          />
          <SearchProductDialog
            open={openSearchDialog}
            onOpenChange={setOpenSearchDialog}
            onSelectConfirm={handleConfirmSelect}
          />
          <AddProductDialog
            open={showCreateFormDialog}
            onOpenChange={handleCreateOpenChange}
            onSuccess={onSuccessHandler}
            queryKey={queryKey}
          />
        </div>
      </div>
    </div>
  );
};

export default PenjualanKasir;
