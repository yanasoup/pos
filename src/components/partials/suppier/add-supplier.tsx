'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { BeatLoader } from 'react-spinners';
import { toast } from 'sonner';
import { z } from 'zod';

import { Form, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import {
  CreateSupplierParams,
  useCreateSupplier,
} from '@/hooks/supplier/useCreateSupplier';
import { cn } from '@/lib/utils';
import { RootState } from '@/redux/store';

import { Button } from '../../ui/button';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../../ui/dialog';

const formSchema = z.object({
  name: z.string().min(1, 'Masukan nama pemasok'),
  address: z.string().min(1, 'Masukan alamat pemasok'),
  contact_person: z.string(),
  phone: z.string(),
  email: z.string(),
});

export type FormData = z.infer<typeof formSchema>;

export type CategoryParams = {
  name: string;
};
interface DialogProps extends React.ComponentProps<typeof Dialog> {
  onSuccess: () => void;
}

const AddSupplierDialog: React.FC<DialogProps> = ({ onSuccess, ...props }) => {
  const uiuxState = useSelector((state: RootState) => state.uiux);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      address: '',
      contact_person: '',
      phone: '',
      email: '',
    },
  });

  const {
    mutate: createSupplierFn,
    isPending,
    isSuccess: isInsertSuccess,
  } = useCreateSupplier();

  function handleSubmit(data: FormData) {
    const newData: CreateSupplierParams = {
      name: data.name,
      requestToken: uiuxState?.apiToken || '',
      tenant_id: uiuxState?.authUser?.tenant_id || -1,
      address: data.address || '',
      contact_person: data.contact_person || '',
      phone: data.phone || '',
      email: data.email || '',
    };
    createSupplierFn(newData);
  }

  React.useEffect(() => {
    if (isInsertSuccess) {
      toast.success('Tambah Pemasok', {
        description: 'Pemasok berhasil ditambahkan',
      });
      onSuccess();
      form.reset();
      form.setFocus('name');
    }
  }, [form, isInsertSuccess, onSuccess]);

  return (
    <Dialog {...props}>
      <DialogContent className='mx-auto flex max-h-[85vh] max-w-[90%] flex-col overflow-scroll px-4 py-6 md:px-6 md:py-6 lg:max-w-[50%]'>
        <DialogTitle className='flex items-center justify-between'>
          <p className='text-md-bold lg:text-xl-bold text-left'>
            Tambah Pemasok
          </p>
        </DialogTitle>
        <DialogDescription className='hidden' />
        <DialogBody className='relative flex flex-col border-0 text-left'>
          <div className='lg:text-md-regular text-sm-regular text-left'>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem className='mt-5 gap-1'>
                      <FormLabel>Nama</FormLabel>
                      <Input
                        {...field}
                        className={cn(
                          form.formState.errors?.name ? 'border-[#EE1D52]' : ''
                        )}
                        placeholder='Masukan nama pemasok'
                        disabled={isPending}
                        type='text'
                        autoComplete='off'
                      />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='address'
                  render={({ field }) => (
                    <FormItem className='mt-5 gap-1'>
                      <FormLabel>Alamat</FormLabel>
                      <Input
                        {...field}
                        className={cn(
                          form.formState.errors?.address
                            ? 'border-[#EE1D52]'
                            : ''
                        )}
                        placeholder='Masukan alamat pemasok'
                        disabled={isPending}
                        type='text'
                        autoComplete='off'
                      />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='contact_person'
                  render={({ field }) => (
                    <FormItem className='mt-5 gap-1'>
                      <FormLabel>Contact Person</FormLabel>
                      <Input
                        {...field}
                        className={cn(
                          form.formState.errors?.contact_person
                            ? 'border-[#EE1D52]'
                            : ''
                        )}
                        placeholder='Masukan contact person'
                        disabled={isPending}
                        type='text'
                        autoComplete='off'
                      />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem className='mt-5 gap-1'>
                      <FormLabel>No. Telepon</FormLabel>
                      <Input
                        {...field}
                        className={cn(
                          'text-sm-regular',
                          form.formState.errors?.phone ? 'border-[#EE1D52]' : ''
                        )}
                        placeholder='Masukan nomor telepon'
                        disabled={isPending}
                        type='text'
                        autoComplete='off'
                      />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem className='mt-5 gap-1'>
                      <FormLabel>Email</FormLabel>
                      <Input
                        {...field}
                        className={cn(
                          form.formState.errors?.email ? 'border-[#EE1D52]' : ''
                        )}
                        placeholder='Masukan email'
                        disabled={isPending}
                        type='email'
                        autoComplete='off'
                      />
                    </FormItem>
                  )}
                />

                <DialogDescription className='mt-5 text-right'>
                  <Button disabled={isPending} variant='default'>
                    {isPending ? <BeatLoader size={10} /> : 'Simpan'}
                  </Button>
                </DialogDescription>
              </form>
            </Form>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default AddSupplierDialog;
