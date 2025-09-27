'use client';
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

import { useGetProductCategory } from '@/hooks/product-category/useGetProductCategory';
import {
  UpdateProductCategoryParams,
  useUpdateProductCategory,
} from '@/hooks/product-category/useUpdateProductCategory';
import { cn } from '@/lib/utils';
import { RootState } from '@/redux/store';

import { Button } from '../../ui/button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const MAX_FILE_SIZE = 1024 * 1024 * 5;
const ACCEPTED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const formSchema = z.object({
  name: z.string().min(1, 'Masukan nama kategori'),
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

export type CategoryParams = {
  name: string;
};
interface DialogProps extends React.ComponentProps<typeof Dialog> {
  onSuccess: () => void;
  showLoader?: boolean;
  dataId: string;
}

const EditProductCategoryDialog: React.FC<DialogProps> = ({
  onSuccess,
  dataId,
  ...props
}) => {
  const [imageUrl, setImageUrl] = React.useState<string | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const uiuxState = useSelector((state: RootState) => state.uiux);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      imageUrl: '',
      image: null,
    },
  });

  const {
    mutate: getCategoryFn,
    isPending: isLoading,
    data: productCategoryData,
  } = useGetProductCategory();

  const {
    isPending: isUpdatePending,
    isSuccess: isUpdateSuccess,
    mutate: updateProductCategoryFn,
    error,
  } = useUpdateProductCategory();

  function handleSubmit(formData: FormData) {
    const newData: UpdateProductCategoryParams = {
      id: dataId,
      data: {
        name: formData.name,
        tenant_id: uiuxState?.authUser?.tenant_id || -1,
        image: formData.image ? formData.image[0] : null,
      },
      requestToken: uiuxState.apiToken!,
    };
    updateProductCategoryFn(newData);
  }

  React.useEffect(() => {
    setImageUrl('');
    setSelectedImage(null);
    form.setValue('imageUrl', '');
    form.reset();

    if (dataId) {
      getCategoryFn({ categoryId: dataId, requestToken: uiuxState.apiToken! });
    }
  }, [dataId, form, getCategoryFn, uiuxState.apiToken]);

  React.useEffect(() => {
    form.reset();
    if (productCategoryData) {
      console.log('productCategoryData', productCategoryData);
      form.setValue('name', productCategoryData.name);
      setImageUrl(
        productCategoryData.image_url
          ? `${BASE_URL}${productCategoryData.image_url}`
          : ''
      );
      form.setValue('imageUrl', `${BASE_URL}${productCategoryData.image_url}`);
      form.setValue('image', null);
    }
  }, [productCategoryData, form]);

  const deleteCoverImage = () => {
    setSelectedImage(null);
    setImageUrl(null);
    form.setValue('imageUrl', undefined);
  };

  React.useEffect(() => {
    if (isUpdateSuccess) {
      toast.success('Update Kategori', {
        description: 'Kategori berhasil diupdate',
      });
      onSuccess();
      form.reset();
    }
  }, [isUpdateSuccess, form, onSuccess]);

  React.useEffect(() => {
    if (error) {
      const axiosError = error as AxiosError;
      toast.warning('Update Kategori', {
        description: `Gagal mengupdate kategori. ${(axiosError?.response?.data as { message: string })?.message ?? 'unknown error'}`,
      });
    }
  }, [error]);

  return (
    <Dialog {...props}>
      <DialogContent className='mx-auto max-h-[85vh] max-w-[90%] overflow-scroll px-4 py-6 md:px-6 md:py-6 lg:max-w-[60%]'>
        <DialogHeader>
          <DialogTitle className='flex items-center justify-between'>
            <p className='text-md-bold lg:text-xl-bold text-left'>
              Edit Kategori Barang
            </p>
          </DialogTitle>
          <DialogDescription className='hidden' />
          <DialogBody className='lg:text-md-regular text-sm-regular relative border-0 text-left'>
            <div className='lg:text-md-regular text-sm-regular relative text-left'>
              {isLoading && (
                <div className='flex-center absolute inset-0'>
                  <BeatLoader size={10} />
                </div>
              )}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                  <FormField
                    control={form.control}
                    name='name'
                    render={({ field }) => (
                      <FormItem className='mt-5 gap-1'>
                        <FormLabel>Nama Kategori</FormLabel>
                        <Input
                          {...field}
                          className={cn(
                            form.formState.errors?.name
                              ? 'border-[#EE1D52]'
                              : ''
                          )}
                          placeholder='Masukan nama kategori'
                          disabled={isUpdatePending}
                          type='text'
                          autoComplete='off'
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='image'
                    render={({ field }) => (
                      <FormItem className='mt-5 gap-1'>
                        <FormLabel>Gambar</FormLabel>
                        <FormControl>
                          <div>
                            <div
                              className={cn(
                                'flex-center flex flex-col gap-1 rounded-2xl border border-dashed p-4 dark:border-neutral-700',
                                form.formState.errors?.image
                                  ? 'border-[#EE1D52]'
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
                                <div className='max-w-[200px]'>
                                  <Image
                                    src={
                                      selectedImage
                                        ? URL.createObjectURL(selectedImage)
                                        : ''
                                    }
                                    alt='Selected'
                                    className='h-auto w-auto object-contain'
                                    width={200}
                                    height={150}
                                  />
                                </div>
                              )}
                              {!selectedImage && (
                                <div className='md:max-w-[200px]'>
                                  {imageUrl && (
                                    <Image
                                      src={imageUrl}
                                      alt='Selected'
                                      className='h-auto w-auto object-contain'
                                      width={200}
                                      height={150}
                                    />
                                  )}
                                </div>
                              )}

                              <p className='flex-center mt-3 gap-2'>
                                <label
                                  htmlFor='fileInput'
                                  className='inline-flex cursor-pointer items-center'
                                >
                                  <Button>
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
                          </div>
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className='my-5 text-right'>
                    <Button disabled={isUpdatePending} variant='default'>
                      {isUpdatePending ? <BeatLoader size={10} /> : 'Simpan'}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </DialogBody>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductCategoryDialog;
