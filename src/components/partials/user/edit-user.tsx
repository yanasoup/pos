import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
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

import { cn } from '@/lib/utils';
import { RootState } from '@/redux/store';

import { Button } from '../../ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';

import { CreateUserParams, useCreateUser } from '@/hooks/user/useCreateUser';
import { MySelect } from '@/components/ui/my-select';
import { useGetRoles } from '@/hooks/role/useGetRole';
import { Role } from '@/types/role';
import { SelectOptions } from '@/types/product';
import { useGetUser } from '@/hooks/user/useGetUser';
import { UpdateUserParams, useUpdateUser } from '@/hooks/user/useUpdateUser';
import { isPending } from '@reduxjs/toolkit';

const formSchema = z
  .object({
    name: z.string().min(1, { message: 'Nama wajib diisi' }),
    email: z.string().min(1, { message: 'Email wajib diisi' }),
    password: z.string().optional(),
    password_confirmation: z.string().optional(),
    role_id: z.string().min(1, { message: 'Pilih Peran User' }),
  })
  .refine(
    (data: any) => {
      // kalau password kosong, tidak perlu validasi
      if (!data.password && !data.password_confirmation) return true;
      // kalau password ada, wajib sama dengan konfirmasi
      return data.password === data.password_confirmation;
    },
    {
      path: ['password_confirmation'],
      message: 'Konfirmasi password tidak sama dengan password',
    }
  );

export type FormData = z.infer<typeof formSchema>;

interface DialogProps extends React.ComponentProps<typeof Dialog> {
  onSuccess: () => void;
  showLoader?: boolean;
  dataId: string;
}

const EditUserDialog: React.FC<DialogProps> = ({
  onSuccess,
  dataId,
  showLoader,
  ...props
}) => {
  const uiuxState = useSelector((state: RootState) => state.uiux);
  const [roles, setRoles] = React.useState<SelectOptions[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role_id: '',
    },
  });

  const { data: rolesData } = useGetRoles([
    'roles',
    {
      limit: 2000,
      page: 1,
      queryString: '',
    },
    uiuxState.apiToken!,
  ]);

  const { data: userData, mutate: getFn, isPending: isLoading } = useGetUser();

  const {
    isPending: isUpdatePending,
    isSuccess: isUpdateSuccess,
    mutate: updateFn,
    error: updateError,
  } = useUpdateUser();

  function handleSubmit(data: FormData) {
    const newData: UpdateUserParams = {
      id: dataId,
      data: data,
      requestToken: uiuxState?.apiToken || '',
    };
    updateFn(newData);
  }

  React.useEffect(() => {
    if (isUpdateSuccess) {
      toast.success('Update User', {
        description: 'User berhasil diupdate',
      });
      onSuccess();
      form.reset();

      const timerId = setTimeout(() => {
        form.setFocus('name');
      }, 100);

      return () => {
        clearTimeout(timerId);
      };
    }
  }, [form, isUpdateSuccess, onSuccess]);

  React.useEffect(() => {
    if (updateError) {
      const axiosError = updateError as AxiosError;
      toast.warning('Update User', {
        description: `Gagal mengupdate data. ${(axiosError?.response?.data as { message: string })?.message ?? 'unknown error'}`,
      });
    }
  }, [updateError]);

  React.useEffect(() => {
    form.reset();

    if (dataId) {
      getFn({ dataId: dataId, requestToken: uiuxState.apiToken! });
    }
  }, [dataId, form, getFn]);

  React.useEffect(() => {
    if (rolesData) {
      const tmp = rolesData.data.data.map((item: Role) => {
        return {
          value: item.id.toString(),
          label: item.role_name,
        };
      });
      setRoles(tmp);
    }
  }, [rolesData]);

  React.useEffect(() => {
    form.reset();
    if (userData) {
      form.setValue('name', userData.name);
      form.setValue('email', userData.email);
      form.setValue('role_id', userData.role_id.toString());
    }
  }, [userData]);

  return (
    <Dialog {...props}>
      <DialogContent className='mx-auto max-h-[85vh] max-w-[90%] overflow-scroll px-4 py-6 md:px-6 md:py-6 lg:max-w-[60%]'>
        <DialogHeader>
          <DialogTitle className='flex items-center justify-between'>
            <p className='text-md-bold lg:text-xl-bold text-left'>Edit User</p>
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
                            form.formState.errors?.name
                              ? 'border-[#EE1D52]'
                              : ''
                          )}
                          placeholder='Masukan nama'
                          disabled={isUpdatePending}
                          type='text'
                          value={field.value ? field.value : ''}
                          autoComplete='off'
                        />
                        <FormMessage />
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
                            form.formState.errors?.email
                              ? 'border-[#EE1D52]'
                              : ''
                          )}
                          placeholder='Masukan email'
                          disabled={isUpdatePending}
                          type='email'
                          value={field.value ? field.value : ''}
                          autoComplete='off'
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem className='mt-5 gap-1'>
                        <FormLabel>Password</FormLabel>
                        <Input
                          {...field}
                          className={cn(
                            form.formState.errors?.password
                              ? 'border-[#EE1D52]'
                              : ''
                          )}
                          placeholder='Masukan password (opsional)'
                          disabled={isUpdatePending}
                          type='password'
                          value={field.value ? field.value : ''}
                          autoComplete='off'
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name='password_confirmation'
                    render={({ field }) => (
                      <FormItem className='mt-5 gap-1'>
                        <FormLabel>Ulangi Password</FormLabel>
                        <Input
                          {...field}
                          className={cn(
                            form.formState.errors?.password_confirmation
                              ? 'border-[#EE1D52]'
                              : ''
                          )}
                          placeholder='ulangi password (opsional)'
                          disabled={isUpdatePending}
                          type='password'
                          value={field.value ? field.value : ''}
                          autoComplete='off'
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name='role_id'
                    render={({ field }) => (
                      <FormItem className='mt-2 gap-0'>
                        <FormLabel>Peran</FormLabel>
                        <MySelect
                          {...field}
                          options={roles}
                          placeholder='Pilih Peran'
                          optionsTitle='Peran'
                          className={cn(
                            form.formState.errors?.role_id
                              ? 'border-destructive'
                              : ''
                          )}
                          value={field.value}
                          onChange={field.onChange}
                        />
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

export default EditUserDialog;
