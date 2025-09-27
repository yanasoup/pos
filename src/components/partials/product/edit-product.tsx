import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@iconify-icon/react';
import { AxiosError } from 'axios';
import { XIcon } from 'lucide-react';
import Image from 'next/image';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { BeatLoader } from 'react-spinners';
import { toast } from 'sonner';
import { z } from 'zod';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormControl,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MySelect } from '@/components/ui/my-select';

import {
  useGetProduct,
  UseGetProductsParams,
} from '@/hooks/product/useGetProduct';
import {
  UpdateProductParams,
  useUpdateProduct,
} from '@/hooks/product/useUpdateProduct';
import { useGetProductCategories } from '@/hooks/product-category/useGetProductCategory';
import { cn, formatNumber, formatNumberFromString } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { unitsObj, SelectOptions, ProductCategory } from '@/types/product';

import { Button } from '../../ui/button';
import {
  Dialog,
  DialogBody,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../../ui/dialog';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const MAX_FILE_SIZE = 1024 * 1024 * 5;
const ACCEPTED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const formSchema = z.object({
  product_code: z.string().min(8, 'Masukan kode barang'),
  name: z.string().min(1, 'Masukan nama barang'),
  description: z.string().optional(),
  price_cogs: z.string().min(1, 'Masukan HPP'),
  // .positive('harus lebih besar dari 0'),
  price: z.string().min(1, 'Masukan harga Jual'),
  // .positive('harus lebih besar dari 0'),
  margin: z.string().optional(),
  pct_margin: z.string().optional(),
  minimum_stock: z.string().min(1, 'Masukan Stok Minimal'),
  // .positive('harus lebih besar dari 0'),
  unit: z.string().min(1, 'Masukan satuan'),
  category_id: z.string('Pilih kategori'),
  imageUrl: z.string().optional(),
  image: z
    .any()
    .optional()
    .refine((files: FileList | undefined) => {
      if (!files || files.length === 0) return true;
      return files[0].size <= MAX_FILE_SIZE;
    }, `Max image size is 5MB.`)
    .refine((files: FileList | undefined) => {
      if (!files || files.length === 0) return true;
      return ACCEPTED_IMAGE_MIME_TYPES.includes(files[0].type);
    }, 'Hanya .jpg, .jpeg, and .png yang diizinkan'),
});

export type FormData = z.infer<typeof formSchema>;

interface DialogProps extends React.ComponentProps<typeof Dialog> {
  onSuccess: () => void;
  queryKey: UseGetProductsParams;
  dataId: string;
}

const EditProductDialog: React.FC<DialogProps> = ({
  onSuccess,
  queryKey,
  dataId,
  ...props
}) => {
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const uiuxState = useSelector((state: RootState) => state.uiux);
  const [categories, setCategories] = React.useState<SelectOptions[]>([]);

  const { data: productCategoriesData } = useGetProductCategories([
    'product-categories',
    { limit: 200, page: 1, queryString: '' },
    uiuxState.apiToken!,
  ]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_code: '',
      name: '',
      description: '',
      price_cogs: '',
      price: '',
      margin: '0',
      pct_margin: '',
      minimum_stock: '0',
      unit: '',
      category_id: '',
      imageUrl: '',
      image: null,
    },
  });

  const {
    mutate: getProductFn,
    isPending: isLoading,
    data: productData,
  } = useGetProduct();

  const {
    isPending: isUpdatePending,
    isSuccess: isUpdateSuccess,
    mutate: updateProductFn,
    error,
  } = useUpdateProduct(queryKey);

  function handleSubmit(data: FormData) {
    const newData: UpdateProductParams = {
      id: dataId,
      data: {
        product_code: data.product_code,
        name: data.name,
        description: data.description,
        price: parseFloat(data.price.replace(/\D/g, '')),
        price_cogs: parseFloat(data.price_cogs.replace(/\D/g, '')),
        unit: data.unit,
        category_id: data.category_id,
        tenant_id: uiuxState?.authUser?.tenant_id || -1,
        image: data.image ? data.image[0] : null,
        minimum_stock: parseInt(data.minimum_stock.replace(/\D/g, '')),
      },
      requestToken: uiuxState.apiToken!,
    };
    updateProductFn(newData);
  }

  React.useEffect(() => {
    setSelectedImage(null);
    setImageUrl('');
    form.setValue('imageUrl', '');
    form.reset();

    if (dataId) {
      getProductFn({ dataId: dataId, requestToken: uiuxState.apiToken! });
    }
  }, [dataId, form, getProductFn, uiuxState.apiToken]);

  React.useEffect(() => {
    form.reset();
    if (productData) {
      form.setValue('product_code', productData.product_code);
      form.setValue('name', productData.name);
      form.setValue('description', productData.description || '');
      form.setValue('price_cogs', formatNumber(productData.price_cogs));
      form.setValue('price', formatNumber(productData.price));
      form.setValue('minimum_stock', formatNumber(productData.minimum_stock));
      form.setValue('unit', productData.unit);
      form.setValue('category_id', productData.category_id.toString());
      setImageUrl(
        productData.image_url ? `${BASE_URL}${productData.image_url}` : ''
      );
      form.setValue('imageUrl', `${BASE_URL}${productData.image_url}`);
      form.setValue('image', null);
      form.setFocus('product_code');
    }
  }, [productData, form]);

  const deleteCoverImage = () => {
    setSelectedImage(null);
    setImageUrl(null);
    form.setValue('imageUrl', '');
  };

  React.useEffect(() => {
    if (productCategoriesData) {
      const tmpCategories = productCategoriesData.data.data.map(
        (category: ProductCategory) => {
          return {
            value: category.id.toString(),
            label: category.name,
          };
        }
      );
      setCategories(tmpCategories);
    }
  }, [productCategoriesData]);

  React.useEffect(() => {
    if (isUpdateSuccess) {
      toast.success('Update Produk', {
        description: 'Produk berhasil diupdate',
      });
      onSuccess();
      setImageUrl(null);
      setSelectedImage(null);
      form.reset();
      form.setFocus('product_code');
    }
  }, [isUpdateSuccess, form, onSuccess]);

  const priceCogsRef = React.useRef<HTMLInputElement>(null);
  const priceRef = React.useRef<HTMLInputElement>(null);
  const minStockRef = React.useRef<HTMLInputElement>(null);
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement>
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if ((e.target as HTMLInputElement).name === 'product_code') {
        form.setFocus('name');
      } else if ((e.target as HTMLInputElement).name === 'name') {
        form.setFocus('description');
      } else if ((e.target as HTMLInputElement).name === 'description') {
        form.setFocus('price_cogs');
        priceCogsRef.current?.focus();
        priceCogsRef.current?.select();
      } else if ((e.target as HTMLInputElement).name === 'price_cogs') {
        form.setFocus('price');
        priceRef.current?.focus();
        priceRef.current?.select();
      } else if ((e.target as HTMLInputElement).name === 'price') {
        form.setFocus('minimum_stock');
        minStockRef.current?.focus();
        minStockRef.current?.select();
      } else if ((e.target as HTMLInputElement).name === 'minimum_stock') {
        form.setFocus('unit');
      } else if ((e.target as HTMLButtonElement).name === 'unit') {
        form.setFocus('category_id');
      }
    }
  };

  React.useEffect(() => {
    if (error) {
      const axiosError = error as AxiosError;
      let errMessages = 'Oops telah terjadi kesalahan. Silahkan hubungi admin.';
      if ([400, 401].includes(axiosError?.status || 500)) {
        errMessages = (axiosError?.response?.data as { message: string })
          ?.message;
      }
      toast.warning('Error', {
        description: errMessages,
      });
      form.setFocus('product_code');
    }
  }, [error, form]);

  const hpp = form.watch('price_cogs')?.replace(/\D/g, '');
  const hargaJual = form.watch('price')?.replace(/\D/g, '');

  React.useEffect(() => {
    if (hpp && hargaJual) {
      const margin = parseFloat(hargaJual) - parseFloat(hpp);
      form.setValue('margin', formatNumberFromString(margin.toString()));
      const pctMargin = (margin / Number(hpp)) * 100;
      form.setValue('pct_margin', formatNumber(pctMargin, 1));
    } else {
      form.setValue('margin', '0');
    }
  }, [hpp, hargaJual, form]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (e.target.name === 'price_cogs') {
      form.setValue('price_cogs', formatNumberFromString(rawValue));
    } else if (e.target.name === 'price') {
      form.setValue('price', formatNumberFromString(rawValue));
    } else if (e.target.name === 'minimum_stock') {
      form.setValue('minimum_stock', formatNumberFromString(rawValue));
    }
  };

  return (
    <Dialog {...props}>
      <DialogContent className='mx-auto max-h-[85vh] max-w-[90%] overflow-scroll px-4 py-6 md:px-6 md:py-6 lg:max-w-[60%]'>
        <DialogHeader>
          <DialogTitle className='flex items-center justify-between'>
            <p className='text-md-bold lg:text-xl-bold text-left'>
              Tambah Item
            </p>
          </DialogTitle>
          <DialogDescription className='hidden' />
          <DialogBody className='lg:text-md-regular text-sm-regular relative border-0 text-left'>
            {isLoading && (
              <div className='flex-center bg-background absolute inset-0 z-100 flex h-full w-full flex-col'>
                <span className='text-xs lg:text-sm'>
                  {isLoading ? 'memuat data...' : 'menyimpan data...'}
                </span>
                <BeatLoader color='#d5d7da' size={10} />
              </div>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <div className='flex flex-col flex-wrap gap-4 md:flex-row'>
                  <div className='flex-2'>
                    <FormField
                      control={form.control}
                      name='product_code'
                      render={({ field }) => (
                        <FormItem className='mt-2 gap-0'>
                          <FormLabel>Kode Barang</FormLabel>
                          <Input
                            {...field}
                            className={cn(
                              form.formState.errors?.product_code
                                ? 'border-destructive'
                                : ''
                            )}
                            placeholder='Masukan kode barang'
                            disabled={isUpdatePending}
                            type='text'
                            autoComplete='off'
                            onKeyDown={handleKeyDown}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='name'
                      render={({ field }) => (
                        <FormItem className='mt-2 gap-0'>
                          <FormLabel>Nama Barang</FormLabel>
                          <Input
                            {...field}
                            className={cn(
                              form.formState.errors?.name
                                ? 'border-destructive'
                                : ''
                            )}
                            placeholder='Masukan nama barang'
                            disabled={isUpdatePending}
                            type='text'
                            autoComplete='off'
                            onKeyDown={handleKeyDown}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='description'
                      render={({ field }) => (
                        <FormItem className='mt-2 gap-0'>
                          <FormLabel>Deskripsi</FormLabel>
                          <Input
                            {...field}
                            className={cn(
                              form.formState.errors?.description
                                ? 'border-destructive'
                                : ''
                            )}
                            placeholder='Masukan deskripsi barang'
                            disabled={isUpdatePending}
                            type='number'
                            autoComplete='off'
                            onKeyDown={handleKeyDown}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className='flex flex-col gap-2 md:flex-row'>
                      <FormField
                        control={form.control}
                        name='price_cogs'
                        render={({ field }) => (
                          <FormItem className='mt-2 gap-0'>
                            <FormLabel>HPP</FormLabel>
                            <Input
                              {...field}
                              ref={priceCogsRef}
                              name='price_cogs'
                              className={cn(
                                form.formState.errors?.price_cogs
                                  ? 'border-destructive'
                                  : ''
                              )}
                              placeholder='Masukan HPP'
                              disabled={isUpdatePending}
                              type='text'
                              autoComplete='off'
                              onKeyDown={handleKeyDown}
                              value={field.value ? field.value : ''}
                              onChange={handlePriceChange}
                            />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='price'
                        render={({ field }) => (
                          <FormItem className='mt-2 gap-0'>
                            <FormLabel>Harga Jual</FormLabel>
                            <Input
                              {...field}
                              ref={priceRef}
                              name='price'
                              className={cn(
                                form.formState.errors?.price
                                  ? 'border-destructive'
                                  : ''
                              )}
                              placeholder='Masukan harga'
                              disabled={isUpdatePending}
                              type='text'
                              autoComplete='off'
                              onKeyDown={handleKeyDown}
                              value={field.value ? field.value : ''}
                              onChange={handlePriceChange}
                            />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='margin'
                        render={({}) => (
                          <FormItem className='mt-2 gap-0'>
                            <FormLabel>Margin</FormLabel>
                            <Input
                              id='margin'
                              {...form.register('margin', {
                                valueAsNumber: false,
                              })}
                              className={cn(
                                form.formState.errors?.margin
                                  ? 'border-destructive'
                                  : ''
                              )}
                              readOnly={true}
                              type='text'
                              autoComplete='off'
                            />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='pct_margin'
                        render={({ field }) => (
                          <FormItem className='mt-2 gap-0'>
                            <FormLabel>% Margin</FormLabel>
                            <Input
                              {...field}
                              name='pct_margin'
                              className={cn(
                                form.formState.errors?.margin
                                  ? 'border-destructive'
                                  : ''
                              )}
                              value={field.value ? field.value : ''}
                              readOnly={true}
                              type='text'
                              autoComplete='off'
                            />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name='minimum_stock'
                        render={({ field }) => (
                          <FormItem className='mt-2 gap-0'>
                            <FormLabel>Stok Min.</FormLabel>
                            <Input
                              name='minimum_stock'
                              ref={minStockRef}
                              className={cn(
                                form.formState.errors?.minimum_stock
                                  ? 'border-destructive'
                                  : ''
                              )}
                              disabled={isUpdatePending}
                              type='text'
                              autoComplete='off'
                              value={field.value ? field.value : ''}
                              onChange={handlePriceChange}
                            />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name='unit'
                      render={({ field }) => (
                        <FormItem className='mt-2 gap-0'>
                          <FormLabel>Satuan</FormLabel>
                          <MySelect
                            {...field}
                            options={unitsObj}
                            placeholder='Pilih satuan'
                            optionsTitle='Satuan'
                            className={cn(
                              form.formState.errors?.unit
                                ? 'border-destructive'
                                : ''
                            )}
                            value={field.value}
                            onChange={field.onChange}
                            onKeyDown={handleKeyDown}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name='category_id'
                      render={({ field }) => (
                        <FormItem className='mt-2 gap-0'>
                          <FormLabel>Kategori</FormLabel>
                          <MySelect
                            {...field}
                            name='category_id'
                            options={categories}
                            placeholder='Pilih Kategori'
                            optionsTitle='Kategori'
                            className={cn(
                              form.formState.errors?.category_id
                                ? 'border-destructive'
                                : ''
                            )}
                            value={field.value.toString()}
                            onChange={field.onChange}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className='basis-55'>
                    <FormField
                      control={form.control}
                      name='image'
                      render={({ field }) => (
                        <FormItem className='mt-0 gap-0 md:mt-2'>
                          <FormLabel>Gambar</FormLabel>
                          <FormControl>
                            <div
                              className={cn(
                                'flex-center flex flex-col gap-1 rounded-2xl border border-dashed p-4 dark:border-neutral-700',
                                form.formState.errors?.image
                                  ? 'border-destructive'
                                  : ''
                              )}
                            >
                              <input
                                type='file'
                                className='hidden'
                                id='fileInput'
                                accept='image/*'
                                onBlur={field.onBlur}
                                name={field.name}
                                onChange={(e) => {
                                  field.onChange(e.target.files);
                                  setSelectedImage(e.target.files?.[0] || null);
                                }}
                                ref={field.ref}
                              />
                              {selectedImage && (
                                <div className='size-20 md:size-40'>
                                  <Image
                                    src={URL.createObjectURL(selectedImage)}
                                    alt='Selected'
                                    className='h-auto w-auto object-contain'
                                    width={150}
                                    height={100}
                                    unoptimized={true}
                                  />
                                </div>
                              )}
                              {!selectedImage && (
                                <div className='size-20 md:size-40'>
                                  {imageUrl && (
                                    <Image
                                      className='h-auto w-auto object-contain'
                                      src={imageUrl}
                                      alt='Selected'
                                      width={150}
                                      height={100}
                                      unoptimized={true}
                                    />
                                  )}
                                </div>
                              )}

                              <p className='flex-center mt-3 w-full flex-1 flex-wrap gap-2'>
                                <label
                                  htmlFor='fileInput'
                                  className='inline-flex cursor-pointer items-center'
                                >
                                  <Button>
                                    {' '}
                                    <Icon
                                      icon='lucide:arrow-up-to-line'
                                      size={20}
                                    />
                                    Ganti Gambar
                                  </Button>
                                </label>
                                <Button
                                  variant={'outline'}
                                  onClick={deleteCoverImage}
                                >
                                  <Icon icon='mage:trash' size={20} />
                                  Hapus Gambar
                                </Button>
                              </p>
                              <p className='text-xs-regular mt-2'>
                                PNG / JPG (max. 5mb)
                              </p>
                            </div>
                          </FormControl>

                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className='my-5 text-right'>
                  <Button disabled={isUpdatePending} variant='default'>
                    {isUpdatePending ? <BeatLoader size={10} /> : 'Simpan'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogBody>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductDialog;
