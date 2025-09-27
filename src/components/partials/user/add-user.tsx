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

const formSchema = z
  .object({
    name: z.string().min(1, { message: 'Nama wajib diisi' }),
    email: z.string().min(1, { message: 'Email wajib diisi' }),
    password: z.string().min(1, { message: 'Password wajib diisi' }),
    password_confirmation: z
      .string()
      .min(1, { message: 'Konfirmasi password wajib diisi' }),
    role_id: z.string().min(1, { message: 'Pilih Peran User' }),
  })
  .refine((data: any) => data.password === data.password_confirmation, {
    path: ['password_confirmation'],
    message: 'Konfirmasi password tidak sama dengan password',
  });

export type FormData = z.infer<typeof formSchema>;

interface DialogProps extends React.ComponentProps<typeof Dialog> {
  onSuccess: () => void;
}

const AddUserDialog: React.FC<DialogProps> = ({ onSuccess, ...props }) => {
  const uiuxState = useSelector((state: RootState) => state.uiux);
  const [inputValue, setInputValue] = React.useState('');

  const [roles, setRoles] = React.useState<SelectOptions[]>([]);

  const { data: rolesData, isFetching } = useGetRoles([
    'roles',
    {
      limit: 2000,
      page: 1,
      queryString: '',
    },
    uiuxState.apiToken!,
  ]);

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

  const {
    mutate: createFn,
    isPending,
    isSuccess: isInsertSuccess,
    error: insertError,
  } = useCreateUser();

  function handleSubmit(data: FormData) {
    const newData: CreateUserParams = {
      ...data,
      requestToken: uiuxState?.apiToken || '',
    };
    createFn(newData);
  }

  React.useEffect(() => {
    if (isInsertSuccess) {
      toast.success('Tambah Peran', {
        description: 'Peran berhasil ditambahkan',
      });
      onSuccess();
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
      toast.warning('Tambah User', {
        description: `Gagal menambahkan data. ${(axiosError?.response?.data as { message: string })?.message ?? 'unknown error'}`,
      });
    }
  }, [insertError]);

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

  return (
    <Dialog {...props}>
      <DialogContent className='mx-auto max-h-[85vh] max-w-[90%] overflow-scroll px-4 py-6 md:px-6 md:py-6 lg:max-w-[60%]'>
        <DialogHeader>
          <DialogTitle className='flex items-center justify-between'>
            <p className='text-md-bold lg:text-xl-bold text-left'>
              Tambah User
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
                        <FormLabel>Nama</FormLabel>
                        <Input
                          {...field}
                          className={cn(
                            form.formState.errors?.name
                              ? 'border-[#EE1D52]'
                              : ''
                          )}
                          placeholder='Masukan nama'
                          disabled={isPending}
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
                          disabled={isPending}
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
                          placeholder='Masukan password'
                          disabled={isPending}
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
                          placeholder='ulangi password'
                          disabled={isPending}
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

export default AddUserDialog;
