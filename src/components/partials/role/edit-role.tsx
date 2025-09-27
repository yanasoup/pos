'use client';
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
import { useGetRole } from '@/hooks/role/useGetRole';
import { UpdateRoleParams, useUpdateRole } from '@/hooks/role/useUpdateRole';

import { extractedMenuUrls as posMenus } from '@/constants/nav-items';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  role_name: z.string().min(1, 'Masukan nama peran'),
  granted_menus: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message: 'Anda harus memilih minimal satu menu.',
    }),
});

export type FormData = z.infer<typeof formSchema>;
interface DialogProps extends React.ComponentProps<typeof Dialog> {
  onSuccess: () => void;
  showLoader?: boolean;
  dataId: string;
}

const EditRoleDialog: React.FC<DialogProps> = ({
  onSuccess,
  dataId,
  ...props
}) => {
  const uiuxState = useSelector((state: RootState) => state.uiux);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role_name: '',
      granted_menus: [],
    },
  });

  const {
    mutate: getRoleFn,
    isPending: isLoading,
    data: roleData,
  } = useGetRole();

  const {
    isPending: isUpdatePending,
    isSuccess: isUpdateSuccess,
    mutate: updateRoleFn,
    error,
  } = useUpdateRole();

  function handleSubmit(formData: FormData) {
    const newData: UpdateRoleParams = {
      id: dataId,
      data: {
        role_name: formData.role_name,
        tenant_id: uiuxState?.authUser?.tenant_id || -1,
        granted_menus: formData.granted_menus,
      },
      requestToken: uiuxState.apiToken!,
    };
    updateRoleFn(newData);
  }

  React.useEffect(() => {
    form.reset();

    if (dataId) {
      getRoleFn({ dataId: dataId, requestToken: uiuxState.apiToken! });
    }
  }, [dataId, form, getRoleFn, uiuxState.apiToken]);

  React.useEffect(() => {
    // form.reset();
    if (roleData) {
      form.setValue('role_name', roleData.role_name);
      const tmpGrantedMenus = JSON.parse(roleData.granted_menus);
      form.setValue('granted_menus', tmpGrantedMenus);
    }
  }, [roleData, form]);

  React.useEffect(() => {
    if (isUpdateSuccess) {
      toast.success('Update Peran', {
        description: 'Peran berhasil diupdate',
      });
      onSuccess();
      form.reset();
    }
  }, [isUpdateSuccess, form, onSuccess]);

  React.useEffect(() => {
    if (error) {
      const axiosError = error as AxiosError;
      toast.warning('Update Peran', {
        description: `Gagal mengupdate peran. ${(axiosError?.response?.data as { message: string })?.message ?? 'unknown error'}`,
      });
    }
  }, [error]);

  return (
    <Dialog {...props}>
      <DialogContent className='mx-auto max-h-[85vh] max-w-[90%] overflow-scroll px-4 py-6 md:px-6 md:py-6 lg:max-w-[60%]'>
        <DialogHeader>
          <DialogTitle className='flex items-center justify-between'>
            <p className='text-md-bold lg:text-xl-bold text-left'>Edit Peran</p>
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
                    name='role_name'
                    render={({ field }) => (
                      <FormItem className='mt-5 gap-1'>
                        <FormLabel>Nama Peran</FormLabel>
                        <Input
                          {...field}
                          className={cn(
                            form.formState.errors?.role_name
                              ? 'border-[#EE1D52]'
                              : ''
                          )}
                          placeholder='Masukan nama peran'
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
                    name='granted_menus'
                    render={() => (
                      <FormItem>
                        <FormLabel>Menu</FormLabel>
                        <div className='grid grid-cols-1 gap-y-3 md:grid-cols-[repeat(3,max-content)] md:gap-x-9.25 md:gap-y-4'>
                          {posMenus.map((menu) => (
                            <FormField
                              key={menu}
                              control={form.control}
                              name='granted_menus'
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={menu}
                                    className='flex items-center gap-3'
                                  >
                                    <FormControl>
                                      <Checkbox
                                        disabled={isLoading}
                                        checked={field.value?.includes(menu)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...field.value,
                                                menu,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== menu
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel>{menu}</FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
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

export default EditRoleDialog;
