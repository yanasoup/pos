'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@iconify/react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@radix-ui/react-popover';
import { AxiosError } from 'axios';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  CalendarIcon,
  ShoppingCart,
  SquarePenIcon,
  Trash2Icon,
} from 'lucide-react';
import { XIcon } from 'lucide-react';
import React, { useCallback } from 'react';
import { ControllerRenderProps, useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { BeatLoader } from 'react-spinners';
import { toast } from 'sonner';
import { z } from 'zod';

import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { useGetProductByCode } from '@/hooks/product/useGetProduct';
import {
  CreatePurchaseParams,
  useCreatePurchase,
} from '@/hooks/purchase/useCreateMasterPurchase';
import { UseGetPurchasesParams } from '@/hooks/purchase/useGetPurchase';
import {
  ceilToNearest100,
  formatNumber,
  formatNumberFromString,
} from '@/lib/utils';
import { cn } from '@/lib/utils';
import { RootState } from '@/redux/store';
import {
  addToPurchaseCart,
  PurchaseCartItem,
  removeFromPurchaseCart,
  resetPurchaseCart,
  SaleCartItem,
  updateMasterPurchaseCart,
  updatePurchaseCart,
} from '@/redux/ui-slice';

import { Button } from '../../ui/button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
  DialogHeader,
} from '../../ui/dialog';
import SupplierCombobox from '../common/combobox-supplier';
import MyConfirmationDialog from '../common/confirmation-dialog';
import SearchProductDialog from '../common/search-product-dialog';
const formSchema = z
  .object({
    purchase_no: z.string().min(1, 'Masukan nomor pembelian'),
    purchase_date: z.string('Pilih tanggal pembelian.'),
    supplier_id: z.string().min(1, 'Pilih supplier'),
    supplier: z.string().min(1, 'Pilih supplier'),
    notes: z.string().optional(),
    product_id: z.string(),
    product_name: z.string().optional(),
    product_code: z.string(),
    qty: z.string().min(1, 'Masukan Qty'),
    // .positive('qty harus lebih besar dari 0'),
    price: z.string().min(1, 'HPP tidak boleh kosong'),
    // .positive('harga harus lebih besar dari 0'),
    sale_price: z.string().optional(),
    isAutoPriceCheck: z.boolean(),
    rate_harga_jual: z.union([z.number(), z.nan()]).optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.isAutoPriceCheck &&
      (typeof data.rate_harga_jual !== 'number' || isNaN(data.rate_harga_jual))
    ) {
      ctx.addIssue({
        path: ['rate_harga_jual'],
        code: 'custom',
        message: 'rate harus diisi',
      });
    }
  });
export type FormData = z.infer<typeof formSchema>;

interface DialogProps extends React.ComponentProps<typeof Dialog> {
  onSaveSuccess: () => void;
  queryKey: UseGetPurchasesParams;
}

const AddPurchaseDialog: React.FC<DialogProps> = ({
  onSaveSuccess,
  queryKey,
  ...props
}) => {
  const [autoSalePrice, setAutoSalePrice] = React.useState<boolean>(true);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const uiuxState = useSelector((state: RootState) => state.uiux);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [deleteDataId, setDeleteDataId] = React.useState<string | null>(null);
  const [openSearchDialog, setOpenSearchDialog] = React.useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = React.useState<
    string | null
  >(null);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      purchase_no: uiuxState.purchaseCart.master.purchase_no,
      purchase_date: uiuxState.purchaseCart.master?.purchase_date,
      supplier_id: uiuxState.purchaseCart.master.supplier_id || '',
      supplier: uiuxState.purchaseCart.master.supplier || '',
      notes: uiuxState.purchaseCart.master.notes || '',
      product_id: '',
      product_code: '',
      product_name: '',
      qty: '',
      price: '',
      isAutoPriceCheck: true,
      rate_harga_jual: 10,
      sale_price: '',
    },
  });
  const {
    mutate: createFn,
    isPending,
    isSuccess: isInsertSuccess,
    error: insertError,
  } = useCreatePurchase(queryKey);

  const dispatch = useDispatch();
  function addItemToCart(formData: FormData) {
    if (isEditMode) {
      updateHandler();
    } else {
      const existingItem = uiuxState.purchaseCart.detail.find(
        (item) => item.product_id === formData.product_id
      );
      if (existingItem) {
        toast(
          <span className='font-semibold text-red-400'>Produk Sudah Ada</span>,
          {
            description:
              'Produk tersebut sudah ada di Keranjang belanja Anda. Untuk mengubah quantity dan harga produk silahkan klik tombol edit produk tersebut',
          }
        );

        form.setFocus('product_code');
        if (productCodeInputRef.current) {
          productCodeInputRef.current.select();
        }

        return;
      }

      const newData: PurchaseCartItem = {
        master: {
          purchase_no: formData.purchase_no,
          purchase_date: formData.purchase_date,
          supplier_id: formData.supplier_id,
          supplier: formData.supplier,
          notes: formData.notes,
          isAutoPriceCheck: formData.isAutoPriceCheck,
          rate_harga_jual: formData.rate_harga_jual || 0,
        },
        detail: {
          product_id: productByCodeData?.id || '',
          product_name: productByCodeData?.name || '',
          product_code: productByCodeData?.product_code || '',
          qty: parseInt(formData.qty.replace(/\D/g, '')),
          price_cogs: parseFloat(formData.price.replace(/\D/g, '')),
          price: parseFloat(
            formData.sale_price?.replace(/\D/g, '') ?? formData.price
          ),
        },
      };
      dispatch(addToPurchaseCart(newData));
      resetFormState();
    }
  }
  const updateHandler = () => {
    const updateData: PurchaseCartItem = {
      master: {
        purchase_no: form.getValues('purchase_no'),
        purchase_date: form.getValues('purchase_date'),
        supplier_id: form.getValues('supplier_id'),
        supplier: form.getValues('supplier'),
        notes: form.getValues('notes'),
        isAutoPriceCheck: form.getValues('isAutoPriceCheck'),
        rate_harga_jual: Number(form.getValues('rate_harga_jual')),
      },
      detail: {
        product_id: form.getValues('product_id'),
        product_name: form.getValues('product_name') || '',
        product_code: form.getValues('product_code'),
        qty: Number(form.getValues('qty').replace(/\D/g, '')),
        price_cogs: Number(form.getValues('price').replace(/\D/g, '')),
        price: Number(
          form.getValues('sale_price')?.replace(/\D/g, '') ??
            form.getValues('price').replace(/\D/g, '')
        ),
      },
    };
    dispatch(updatePurchaseCart(updateData));
    resetFormState();
  };

  const resetFormState = useCallback(() => {
    form.setValue('qty', '');
    form.setValue('price', '');
    form.setValue('sale_price', '');
    form.setValue('product_code', '');
    form.setValue('product_id', '');
    form.setValue('product_name', '');
    form.setFocus('product_code');
    setSelectedSupplierId(uiuxState.purchaseCart.master.supplier_id || '');
    setIsEditMode(false);
  }, [form, uiuxState.purchaseCart.master.supplier_id]);

  const {
    data: productByCodeData,
    mutate: getProductByCode,
    isPending: getProductByCodePending,
    error: productByCodeError,
  } = useGetProductByCode();

  const hppInputRef = React.useRef<HTMLInputElement>(null);
  const hargaJualInputRef = React.useRef<HTMLInputElement>(null);
  const productCodeInputRef = React.useRef<HTMLInputElement>(null);
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if ((e.target as HTMLInputElement).name === 'product_code') {
        if (!isEditMode) {
          getProductByCode({
            productCode: e.currentTarget.value,
            requestToken: uiuxState.apiToken!,
          });
        }
        form.setFocus('qty');
        qtyInputRef.current?.focus();
        qtyInputRef.current?.select();
      } else if ((e.target as HTMLInputElement).name === 'product_id') {
        form.setFocus('qty');
      } else if ((e.target as HTMLInputElement).name === 'qty') {
        form.setFocus('price');
        hppInputRef.current?.focus();
        hppInputRef.current?.select();
      } else if ((e.target as HTMLInputElement).name === 'price') {
        if (autoSalePrice) {
          const hpp = Number(form.getValues('price').replace(/\D/g, ''));
          const salePrice =
            Number(hpp) +
            Number(hpp) * (Number(form.getValues('rate_harga_jual')) / 100);

          form.setValue(
            'sale_price',
            formatNumber(ceilToNearest100(salePrice))
          );
        }
        //  else {
        form.setFocus('sale_price');
        hargaJualInputRef.current?.focus();
        hargaJualInputRef.current?.select();
        // }
      }
    }
  };

  const handleFormatNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (e.target.name === 'qty') {
      form.setValue('qty', formatNumberFromString(rawValue));
    } else if (e.target.name === 'price') {
      form.setValue('price', formatNumberFromString(rawValue));
    } else if (e.target.name === 'sale_price') {
      form.setValue('sale_price', formatNumberFromString(rawValue));
    }
  };

  React.useEffect(() => {
    if (productByCodeData) {
      form.setValue('product_id', productByCodeData.id.toString());
      form.setValue('product_name', productByCodeData.name);
      form.setValue('price', formatNumber(productByCodeData.price_cogs) || '');
      form.setValue('sale_price', formatNumber(productByCodeData.price) || '');
    }
    if (productByCodeError) {
      const axiosError = productByCodeError as AxiosError;
      toast.error('Info', {
        description: `Kode barang tidak valid. ${(axiosError?.response?.data as { message: string })?.message ?? 'unknown error'}`,
      });
      form.setValue('product_name', 'barang tidak ditemukan!');
      form.setValue('qty', '');
      form.setValue('price', '');
      form.setValue('sale_price', '');
      form.setFocus('product_code');
    }
  }, [productByCodeData, productByCodeError, form]);

  const startEditHandler = (dataId: string) => {
    const cartItem = uiuxState.purchaseCart.detail.find(
      (item) => item.product_id === dataId
    ) as SaleCartItem;

    setIsEditMode(true);
    form.setValue('product_id', cartItem.product_id);
    form.setValue('product_code', cartItem.product_code);
    form.setValue('product_name', cartItem.product_name);
    form.setValue('qty', formatNumber(cartItem.qty));
    form.setValue('price', formatNumber(cartItem.price_cogs));
    form.setValue('sale_price', formatNumber(cartItem.price));
    form.setFocus('qty');
    qtyInputRef.current?.select();
  };

  const startDeleteHandler = (productCode: string) => {
    setDeleteDataId(productCode);
    setShowDeleteDialog(true);
  };

  const confirmDeleteHandler = (productCode: string) => {
    dispatch(removeFromPurchaseCart(productCode));
    setIsEditMode(false);
  };

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (
        !isEditMode &&
        !isPending &&
        e.key === 'k' &&
        (e.metaKey || e.ctrlKey) &&
        props.open
      ) {
        e.preventDefault();
        setOpenSearchDialog((show) => !show);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isEditMode, props.open, isPending]);

  const qtyInputRef = React.useRef<HTMLInputElement>(null);
  const handleConfirmSelect = (selecteditem: string) => {
    setOpenSearchDialog(false);
    const arrItem = selecteditem.split('||');
    form.setValue('product_code', arrItem?.[0] || '');
    getProductByCode({
      productCode: arrItem?.[0],
      requestToken: uiuxState.apiToken!,
    });

    const timerId = setTimeout(() => {
      form.setFocus('qty');
      if (qtyInputRef.current) {
        qtyInputRef.current.select();
      }
    }, 100);

    return () => {
      clearTimeout(timerId);
    };
  };
  const handleConfirmSelectedSupplier = (item: string) => {
    const arrItem = item.split('||');
    form.setValue('supplier_id', arrItem?.[0] || '');
    setSelectedSupplierId(form.getValues('supplier_id'));
    setTimeout(() => {
      dispatch(
        updateMasterPurchaseCart({
          purchase_id: uiuxState.purchaseCart.master.purchase_id,
          purchase_no: form.getValues('purchase_no'),
          purchase_date: form.getValues('purchase_date'),
          supplier_id: form.getValues('supplier_id'),
          supplier: form.getValues('supplier'),
          notes: form.getValues('notes'),
          isAutoPriceCheck: form.getValues('isAutoPriceCheck'),
          rate_harga_jual: Number(form.getValues('rate_harga_jual')),
        })
      );
    }, 100);
  };

  React.useEffect(() => {
    if (props.open) {
      resetFormState();
    }
  }, [props.open, resetFormState]);

  const commitTransaction = async () => {
    // const isValid = await form.trigger();
    // if (!isValid) {
    //   toast.warning(`Lengkapi form terlebih dahulu`);
    //   return;
    // }

    const data: CreatePurchaseParams = {
      data: {
        master: {
          tenant_id: uiuxState.authUser?.tenant_id || -1,
          purchase_no: form.getValues('purchase_no'),
          purchase_date: form.getValues('purchase_date'),
          supplier_id: selectedSupplierId || '',
          notes: form.getValues('notes'),
          isAutoPriceCheck: form.getValues('isAutoPriceCheck'),
          rate_harga_jual: Number(form.getValues('rate_harga_jual')),
        },
        items: uiuxState.purchaseCart.detail,
      },
      requestToken: uiuxState.apiToken!,
    };
    createFn(data);
  };

  React.useEffect(() => {
    if (isInsertSuccess) {
      toast.success('Sukses', {
        description: 'Data berhasil disimpan.',
      });

      form.reset();
      setIsEditMode(false);

      dispatch(resetPurchaseCart());

      const timerId = setTimeout(() => {
        if (productCodeInputRef.current) {
          productCodeInputRef.current.focus();
        }
      }, 100);

      onSaveSuccess();

      return () => {
        clearTimeout(timerId);
      };
    }
  }, [isInsertSuccess, form, uiuxState?.apiToken, dispatch, onSaveSuccess]);
  React.useEffect(() => {
    if (insertError) {
      const axiosError = insertError as AxiosError;
      toast.error('Simpan', {
        description: `Data gagal disimpan. ${(axiosError?.response?.data as { message: string })?.message ?? 'unknown error'}`,
      });
      form.setFocus('purchase_no');
      setIsEditMode(false);
    }
  }, [form, insertError]);

  return (
    <Dialog {...props}>
      <DialogContent className='mx-auto max-h-[85vh] max-w-[90%] overflow-scroll px-4 py-6 md:px-6 md:py-6 lg:max-w-[60%]'>
        <DialogHeader>
          <DialogTitle className='flex items-center justify-between'>
            <p className='text-md-bold lg:text-xl-bold text-left'>
              Input Detail Pembelian
            </p>
          </DialogTitle>
          <DialogDescription className='hidden' />
          <DialogBody className='lg:text-md-regular text-sm-regular relative flex flex-col border-0 text-left'>
            {isPending && (
              <div className='flex-center absolute inset-0 z-5 flex flex-col'>
                <span className='text-xs lg:text-sm'>menyimpan data...</span>
                <BeatLoader size={10} />
              </div>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(addItemToCart)}>
                <div className='flex flex-col flex-wrap gap-1 rounded-tl-md rounded-tr-md border p-2 pb-6 md:flex-row lg:gap-4'>
                  <div className='flex flex-2 flex-col gap-1'>
                    <div className='flex flex-col'>
                      <FormField
                        control={form.control}
                        name='purchase_no'
                        render={({ field }) => (
                          <FormItem className='mt-0 gap-0'>
                            <FormLabel>No. Pembelian / No. Faktur</FormLabel>
                            <Input
                              {...field}
                              className={cn(
                                form.formState.errors?.purchase_no
                                  ? 'border-destructive'
                                  : ''
                              )}
                              placeholder='Masukan No. Pembelian / No. Faktur'
                              disabled={false}
                              type='text'
                              autoComplete='off'
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className='flex flex-col'>
                      <FormField
                        control={form.control}
                        name='purchase_date'
                        render={({ field }) => (
                          <FormItem className='mt-0 gap-0'>
                            <FormLabel>Tanggal Pembelian</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant={'outline'}
                                    className={cn(
                                      !field.value && 'text-muted-foreground',
                                      form.formState.errors?.purchase_date
                                        ? 'border-destructive'
                                        : ''
                                    )}
                                  >
                                    {field.value ? (
                                      format(field.value, 'dd MMM yyyy', {
                                        locale: id,
                                      })
                                    ) : (
                                      <span>Pilih</span>
                                    )}
                                    <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className='z-5 w-auto p-0'
                                align='start'
                              >
                                <Calendar
                                  mode='single'
                                  selected={
                                    field.value
                                      ? parseISO(field.value)
                                      : parseISO(
                                          format(
                                            new Date(),
                                            'yyyy-MM-dd HH:mm:ss zzz',
                                            { locale: id }
                                          )
                                        )
                                  }
                                  onSelect={(newDate) => {
                                    if (newDate) {
                                      form.setValue(
                                        'purchase_date',
                                        format(newDate, 'yyyy-MM-dd', {
                                          locale: id,
                                        })
                                      );
                                    }
                                  }}
                                  disabled={(date) =>
                                    date >
                                      parseISO(
                                        format(
                                          new Date(),
                                          'yyyy-MM-dd HH:mm:ss zzz',
                                          { locale: id }
                                        )
                                      ) ||
                                    date <
                                      parseISO(
                                        format(
                                          new Date('1900-01-01'),
                                          'yyyy-MM-dd HH:mm:ss zzz',
                                          { locale: id }
                                        )
                                      )
                                  }
                                  captionLayout='dropdown'
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <div className='flex flex-3 flex-wrap gap-1'>
                    <div className='flex w-full flex-col'>
                      <FormField
                        control={form.control}
                        name='supplier'
                        render={({ field }) => (
                          <FormItem className='mt-0 gap-0'>
                            <FormLabel>Supplier</FormLabel>
                            <SupplierCombobox
                              field={
                                field as ControllerRenderProps<
                                  FormData,
                                  'supplier'
                                >
                              }
                              className={cn(
                                form.formState.errors?.supplier_id
                                  ? 'border-destructive'
                                  : ''
                              )}
                              onSelectConfirm={handleConfirmSelectedSupplier}
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className='flex w-full flex-col'>
                      <FormField
                        control={form.control}
                        name='notes'
                        render={({ field }) => (
                          <FormItem className='flex h-full flex-col gap-0'>
                            <FormLabel>Catatan</FormLabel>
                            <Textarea
                              {...field}
                              className={cn(
                                form.formState.errors?.notes
                                  ? 'border-destructive'
                                  : ''
                              )}
                              placeholder='Masukan catatan'
                              disabled={false}
                              autoComplete='off'
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className='text-sm-bold pt-4'>Input Barang</div>

                <div className='overflow-hidden rounded-tl-lg rounded-tr-lg border md:flex-row'>
                  <div className='flex-between flex flex-wrap items-center gap-1 p-2'>
                    <div className='flex-center text-xs'>
                      Cari Barang :
                      <kbd className='text-destructive pointer-events-none inline-flex h-5 items-center gap-1 rounded border-0 px-1.5 font-mono text-xs font-medium opacity-100 select-none lg:text-sm'>
                        <span className='text-xs lg:text-sm'>Ctrl + K</span>
                      </kbd>
                    </div>
                    <div className='flex-center flex flex-1 text-xs'>
                      <ShoppingCart className='size-5' />
                      &nbsp;:&nbsp;
                      <span className='text-destructive text-xs font-medium lg:text-sm'>
                        {uiuxState.purchaseCart.detail?.length}
                      </span>
                      &nbsp;item / Rp
                      <span className='text-destructive text-xs font-medium lg:text-sm'>
                        {formatNumber(
                          uiuxState.purchaseCart.detail?.reduce(
                            (acc, item) => acc + item.qty * item.price_cogs,
                            0
                          ) || 0
                        )}
                      </span>
                    </div>

                    <div className='flex items-center justify-end gap-1'>
                      <Input
                        className='size-4'
                        type='checkbox'
                        {...form.register('isAutoPriceCheck')}
                        onChange={(event) => {
                          setAutoSalePrice(event.target.checked);
                        }}
                      />

                      <p className='flex-center gap-1 text-xs'>
                        AutoCalc
                        <span className='font-bolds text-destructive'>
                          Harga Jual
                        </span>
                        <span className='text-xs'>: HPP +</span>
                      </p>

                      <FormField
                        control={form.control}
                        name='rate_harga_jual'
                        render={({ field }) => (
                          <FormItem className='flex-end flex'>
                            <Input
                              id='rate_harga_jual'
                              {...form.register('rate_harga_jual', {
                                valueAsNumber: true,
                              })}
                              type='number'
                              className={cn(
                                'w-14 px-2 text-xs lg:text-sm',
                                form.formState.errors?.rate_harga_jual
                                  ? 'border-destructive'
                                  : ''
                              )}
                              disabled={!autoSalePrice}
                              {...form.register('rate_harga_jual', {
                                valueAsNumber: true,
                              })}
                              min={1}
                              max={1000}
                              value={field.value ? Number(field.value) : ''}
                            />
                          </FormItem>
                        )}
                      />

                      <p className='flex-center hidden gap-1 text-xs'>
                        <span className='text-sm'>%</span>
                      </p>
                    </div>
                  </div>
                  <div className='flex flex-col flex-wrap gap-0 border-0 border-t px-2 pb-2 md:flex-row md:gap-2'>
                    <FormField
                      control={form.control}
                      name='product_code'
                      render={({ field }) => (
                        <FormItem className='mt-2 flex-4 gap-0'>
                          <FormLabel>Kode Barang</FormLabel>
                          <Input
                            {...field}
                            className={cn(
                              form.formState.errors?.product_code
                                ? 'border-destructive'
                                : ''
                            )}
                            placeholder='Masukan Kode Barang'
                            disabled={isEditMode}
                            type='text'
                            autoComplete='off'
                            onKeyDown={handleKeyDown}
                            readOnly={isEditMode}
                            ref={(el) => {
                              form.register('product_code').ref(el);
                              productCodeInputRef.current = el;
                            }}
                          />

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='product_name'
                      render={({ field }) => (
                        <FormItem className='mt-2 flex-7 gap-0'>
                          <FormLabel>Barang</FormLabel>
                          <div className='relative'>
                            {getProductByCodePending && (
                              <div className='absolute inset-0 flex items-center justify-start px-4'>
                                <BeatLoader size={10} color='#a3ced0' />
                              </div>
                            )}
                            <Input
                              {...field}
                              className={cn(
                                form.formState.errors?.product_name
                                  ? 'border-destructive'
                                  : ''
                              )}
                              disabled={isEditMode}
                              type='text'
                              autoComplete='off'
                              onKeyDown={handleKeyDown}
                              readOnly
                            />
                          </div>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='qty'
                      render={({ field }) => (
                        <FormItem className='mt-2 flex-2 gap-0'>
                          <FormLabel>Qty.</FormLabel>
                          <Input
                            {...field}
                            name='qty'
                            ref={(el) => {
                              form
                                .register('qty', { valueAsNumber: false })
                                .ref(el);
                              qtyInputRef.current = el;
                            }}
                            className={cn(
                              form.formState.errors?.qty
                                ? 'border-destructive'
                                : ''
                            )}
                            type='text'
                            onKeyDown={handleKeyDown}
                            onChange={handleFormatNumber}
                          />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='price'
                      render={({ field }) => (
                        <FormItem className='mt-2 flex-3 gap-0'>
                          <FormLabel>HPP</FormLabel>
                          <Input
                            {...field}
                            name='price'
                            ref={(el) => {
                              form.register('price').ref(el);
                              hppInputRef.current = el;
                            }}
                            className={cn(
                              form.formState.errors?.price
                                ? 'border-destructive'
                                : ''
                            )}
                            placeholder='Masukan harga'
                            type='text'
                            autoComplete='off'
                            onKeyDown={handleKeyDown}
                            onChange={handleFormatNumber}
                          />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='sale_price'
                      render={({ field }) => (
                        <FormItem className='mt-2 flex-3 gap-0'>
                          <FormLabel>Hrg. Jual</FormLabel>
                          <Input
                            {...field}
                            name='sale_price'
                            ref={(el) => {
                              form.register('sale_price').ref(el);
                              hargaJualInputRef.current = el;
                            }}
                            className={cn(
                              form.formState.errors?.sale_price
                                ? 'border-destructive'
                                : ''
                            )}
                            placeholder='harga jual'
                            type='text'
                            autoComplete='off'
                            onChange={handleFormatNumber}
                          />
                        </FormItem>
                      )}
                    />
                    <div className='mt-0 flex flex-col items-center justify-end gap-2'>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant='outline'>
                            <Icon
                              icon='material-symbols:add-shopping-cart'
                              width='24'
                              height='24'
                            />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Tambahkan ke Keranjang</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              </form>
            </Form>
            {/* </DialogBody>

          <DialogBody className='flex overflow-scroll rounded-none border-none'> */}
            <div className='h-[200px] min-h-[200px] overflow-y-scroll'>
              {uiuxState.purchaseCart.detail && (
                <GridPurchaseDetail
                  purchaseData={uiuxState.purchaseCart.detail}
                  startEditHandler={startEditHandler}
                  startDeleteHandler={startDeleteHandler}
                />
              )}
            </div>
            <div className='mt-2 flex-1 items-end text-right'>
              <Button
                variant='default'
                onClick={commitTransaction}
                disabled={isPending}
              >
                {isPending ? <BeatLoader size={10} /> : 'Simpan'}
              </Button>
            </div>
          </DialogBody>
        </DialogHeader>
      </DialogContent>

      <MyConfirmationDialog
        title='Hapus Item'
        description='Anda yakin ingin menghapus item ini dari keranjang?'
        onConfirm={() =>
          deleteDataId !== null && confirmDeleteHandler(deleteDataId)
        }
        onCancel={() => setDeleteDataId(null)}
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        dataId={deleteDataId || ''}
        // showLoader={isDeletePending}
        showLoader={false}
      />
      <SearchProductDialog
        open={openSearchDialog}
        onOpenChange={setOpenSearchDialog}
        onSelectConfirm={handleConfirmSelect}
      />
    </Dialog>
  );
};

type GridPurchaseDetailProps = {
  purchaseData: SaleCartItem[];
  startEditHandler: (dataId: string) => void;
  startDeleteHandler: (dataId: string) => void;
  className?: string;
};
export const GridPurchaseDetail: React.FC<GridPurchaseDetailProps> = ({
  purchaseData,
  startEditHandler,
  startDeleteHandler,
  className,
}) => {
  return (
    <table
      className={cn(
        'h-full w-full border-collapse overflow-auto border',
        className
      )}
    >
      <thead>
        <tr className='bg-muted'>
          <th className='font-regular top-0 border p-2 text-center text-xs lg:text-xs'>
            No
          </th>
          <th className='font-regular top-0 border p-2 text-left text-xs lg:text-xs'>
            Nama Barang
          </th>
          <th className='font-regular top-0 border p-2 text-center text-xs lg:text-xs'>
            Harga
          </th>
          <th className='font-regular top-0 border p-2 text-center text-xs lg:text-xs'>
            Qty
          </th>
          <th className='font-regular top-0 border p-2 text-center text-xs lg:text-xs'>
            Total Harga
          </th>
          <th className='font-regular top-0 border p-2 text-center text-xs lg:text-xs'>
            {' '}
          </th>
        </tr>
      </thead>
      <tbody>
        {purchaseData.length === 0 && (
          <tr>
            <td
              colSpan={6}
              className='border px-2 py-1 text-center text-xs lg:text-xs'
            >
              Keranjang masih kosong
            </td>
          </tr>
        )}
        {purchaseData?.map((item, index) => (
          <tr key={index} className='hover:cursor-pointer'>
            <td className='border px-2 py-1 text-center text-xs lg:text-xs'>
              {index + 1}
            </td>
            <td className='border px-2 py-1 text-left text-xs lg:text-xs'>
              {' '}
              {item.product_name}
            </td>
            <td className='border px-2 py-1 text-center text-xs lg:text-xs'>
              {' '}
              {formatNumber(item.price_cogs || 0)}
            </td>
            <td className='border px-2 py-1 text-center text-xs lg:text-xs'>
              {' '}
              {formatNumber(item.qty || 0)}
            </td>
            <td className='border px-2 py-1 text-right text-xs lg:text-xs'>
              {' '}
              {formatNumber(item.qty * item.price_cogs || 0)}
            </td>
            <td className='border px-2 py-1 text-center text-xs lg:text-xs'>
              {' '}
              <div className='flex-center gap-2'>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => startEditHandler(item.product_id)}
                    >
                      <SquarePenIcon size={12} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side='left'>Edit</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='destructive'
                      size='sm'
                      onClick={() => startDeleteHandler(item.product_id)}
                    >
                      <Trash2Icon size={12} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side='right'>Hapus</TooltipContent>
                </Tooltip>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className='bg-muted hover:cursor-pointer'>
          <td
            colSpan={3}
            className='bottom-0 border p-2 text-left text-xs lg:text-xs'
          >
            Total : {purchaseData?.length} item
          </td>
          <td className='bottom-0 border p-2 text-center text-xs lg:text-xs'>
            {formatNumber(
              purchaseData?.reduce((acc, item) => acc + item.qty, 0) || 0
            )}
          </td>
          <td className='bottom-0 border p-2 text-right text-xs lg:text-xs'>
            {formatNumber(
              purchaseData?.reduce(
                (acc, item) => acc + item.qty * item.price_cogs,
                0
              ) || 0
            )}
          </td>
          <td className='bottom-0 border p-2 text-left text-xs lg:text-xs'>
            {' '}
          </td>
        </tr>
      </tfoot>
    </table>
  );
};
export default AddPurchaseDialog;
