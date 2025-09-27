import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { XIcon } from 'lucide-react';
import { CloudUploadIcon } from 'lucide-react';
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

import {
  CreateProductCategoryParams,
  useCreateProductCategory,
} from '@/hooks/product-category/useCreateProductCategory';
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
const MAX_FILE_SIZE = 1024 * 1024 * 5;
const ACCEPTED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const formSchema = z.object({
  name: z.string().min(1, 'Masukan nama kategori'),
  // name: z.string(),
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
}

const AddProductCategoryDialog: React.FC<DialogProps> = ({
  onSuccess,
  ...props
}) => {
  const uiuxState = useSelector((state: RootState) => state.uiux);
  const [inputValue, setInputValue] = React.useState('');
  const [, setImageUrl] = React.useState<string | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      imageUrl: '',
      image: null,
    },
  });

  const {
    mutate: createProductCategoryFn,
    isPending,
    isSuccess: isInsertSuccess,
    error: insertError,
  } = useCreateProductCategory();

  function handleSubmit(data: FormData) {
    const newData: CreateProductCategoryParams = {
      name: data.name,
      requestToken: uiuxState?.apiToken || '',
      tenant_id: uiuxState?.authUser?.tenant_id || -1,
      image: data.image ? data.image[0] : null,
    };
    createProductCategoryFn(newData);
  }
  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(event.target.value);
    form.setValue('name', event.target.value);
  }

  React.useEffect(() => {
    if (isInsertSuccess) {
      toast.success('Tambah Kategori', {
        description: 'Kategori berhasil ditambahkan',
      });
      onSuccess();
      setImageUrl(null);
      setSelectedImage(null);
      setInputValue('');
      form.reset();

      const timerId = setTimeout(() => {
        form.setFocus('name');
      }, 100);

      return () => {
        clearTimeout(timerId);
      };
    }
  }, [form, isInsertSuccess, onSuccess]);

  React.useEffect(() => {
    if (insertError) {
      const axiosError = insertError as AxiosError;
      toast.warning('Tambah Kategori', {
        description: `Gagal menambahkan kategori. ${(axiosError?.response?.data as { message: string })?.message ?? 'unknown error'}`,
      });
    }
  }, [insertError]);

  return (
    <Dialog {...props}>
      <DialogContent className='mx-auto max-h-[85vh] max-w-[90%] overflow-scroll px-4 py-6 md:px-6 md:py-6 lg:max-w-[60%]'>
        <DialogHeader>
          <DialogTitle className='flex items-center justify-between'>
            <p className='text-md-bold lg:text-xl-bold text-left'>
              Tambah Kategori Barang
            </p>
          </DialogTitle>
          <DialogDescription className='hidden' />
          <DialogBody className='lg:text-md-regular text-sm-regular relative border-0 text-left'>
            <div className='lg:text-md-regular text-sm-regular text-left'>
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
                            'text-sm-regular',
                            form.formState.errors?.name
                              ? 'border-[#EE1D52]'
                              : ''
                          )}
                          placeholder='Masukan nama kategori'
                          disabled={isPending}
                          type='text'
                          value={inputValue}
                          onChange={handleInputChange}
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
                                <div className='md:max-w-[200px]'>
                                  <Image
                                    src={URL.createObjectURL(selectedImage)}
                                    alt='Selected'
                                    width={200}
                                    height={150}
                                  />
                                </div>
                              )}

                              <label
                                htmlFor='fileInput'
                                className='text-neutral-90 inline-flex cursor-pointer items-center rounded-md border border-neutral-300 bg-transparent p-2'
                              >
                                <CloudUploadIcon className='size-10' />
                              </label>
                              <p className='flex gap-1'>
                                <span className='text-sm-semibold'>
                                  Click untuk upload
                                </span>
                                <span className='text-sm-regular'>
                                  atau drag & drop
                                </span>
                              </p>
                              <p className='text-xs-regular'>
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
                    <Button disabled={isPending} variant='default'>
                      {isPending ? <BeatLoader size={10} /> : 'Simpan'}
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

export default AddProductCategoryDialog;
