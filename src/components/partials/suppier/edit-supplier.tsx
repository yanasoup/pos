'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { XIcon } from 'lucide-react';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { useGetSupplier } from '@/hooks/supplier/useGetSupplier';
import {
  UpdateSupplierParams,
  useUpdateSupplier,
} from '@/hooks/supplier/useUpdateSupplier';
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
  showLoader?: boolean;
  dataId: string;
}

const EditSupplierDialog: React.FC<DialogProps> = ({
  onSuccess,
  dataId,
  ...props
}) => {
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
    mutate: getFn,
    isPending: isLoading,
    data: supplierData,
  } = useGetSupplier();

  const {
    isPending: isUpdatePending,
    isSuccess: isUpdateSuccess,
    mutate: updateFn,
  } = useUpdateSupplier();

  function handleSubmit(data: FormData) {
    const newData: UpdateSupplierParams = {
      id: dataId,
      data: {
        name: data.name,
        tenant_id: uiuxState?.authUser?.tenant_id || -1,
        address: data.address,
        contact_person: data.contact_person,
        phone: data.phone,
        email: data.email,
      },
      requestToken: uiuxState.apiToken!,
    };
    updateFn(newData);
  }

  React.useEffect(() => {
    form.reset();

    if (dataId) {
      getFn({ dataId: dataId, requestToken: uiuxState.apiToken! });
    }
  }, [dataId, form, getFn, uiuxState.apiToken]);

  React.useEffect(() => {
    form.reset();
    if (supplierData) {
      form.setValue('name', supplierData.name);
      form.setValue('address', supplierData.address || '');
      form.setValue('contact_person', supplierData.contact_person || '');
      form.setValue('phone', supplierData.phone || '');
      form.setValue('email', supplierData.email || '');
    }
  }, [supplierData, form]);

  React.useEffect(() => {
    if (isUpdateSuccess) {
      toast.success('Update Supplier', {
        description: 'Supplier berhasil diupdate',
      });
      onSuccess();
      form.reset();
      form.setFocus('name');
    }
  }, [isUpdateSuccess, form, onSuccess]);

  return (
    <Dialog {...props}>
      <DialogContent className='mx-auto max-h-[85vh] max-w-[90%] overflow-scroll px-4 py-6 md:px-6 md:py-6 lg:max-w-[60%]'>
        <DialogTitle className='flex items-center justify-between'>
          <p className='text-md-bold lg:text-xl-bold text-left'>
            {' '}
            Edit Pemasok
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
                      <FormLabel>Nama</FormLabel>
                      <Input
                        {...field}
                        className={cn(
                          form.formState.errors?.name ? 'border-[#EE1D52]' : ''
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
                        disabled={isUpdatePending}
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
                        disabled={isUpdatePending}
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
                          form.formState.errors?.phone ? 'border-[#EE1D52]' : ''
                        )}
                        placeholder='Masukan nomor telepon'
                        disabled={isUpdatePending}
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
                      <FormLabel className='text-xs text-neutral-950 lg:text-sm'>
                        Email
                      </FormLabel>
                      <Input
                        {...field}
                        className={cn(
                          form.formState.errors?.email ? 'border-[#EE1D52]' : ''
                        )}
                        placeholder='Masukan email'
                        disabled={isUpdatePending}
                        type='email'
                        autoComplete='off'
                      />
                    </FormItem>
                  )}
                />

                <DialogDescription className='mt-5 text-right'>
                  <Button disabled={isUpdatePending} variant='default'>
                    {isUpdatePending ? <BeatLoader size={10} /> : 'Simpan'}
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

export default EditSupplierDialog;
