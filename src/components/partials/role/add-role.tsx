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

import { CreateRoleParams, useCreateRole } from '@/hooks/role/useCreateRole';
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

const formSchema = z.object({
  role_name: z.string().min(1, 'Masukan nama peran'),
  granted_menus: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message: 'Anda harus memilih minimal satu menu.',
    }),
});
import { extractedMenuUrls as posMenus } from '@/constants/nav-items';

import { Checkbox } from '@/components/ui/checkbox';

export type FormData = z.infer<typeof formSchema>;

export type CategoryParams = {
  name: string;
};
interface DialogProps extends React.ComponentProps<typeof Dialog> {
  onSuccess: () => void;
}

const AddRoleDialog: React.FC<DialogProps> = ({ onSuccess, ...props }) => {
  const uiuxState = useSelector((state: RootState) => state.uiux);
  const [inputValue, setInputValue] = React.useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role_name: '',
      granted_menus: [],
    },
  });

  const {
    mutate: createRoleFn,
    isPending,
    isSuccess: isInsertSuccess,
    error: insertError,
  } = useCreateRole();

  function handleSubmit(data: FormData) {
    const newData: CreateRoleParams = {
      role_name: data.role_name,
      requestToken: uiuxState?.apiToken || '',
      granted_menus: data.granted_menus,
    };
    createRoleFn(newData);
  }
  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(event.target.value);
    form.setValue('role_name', event.target.value);
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
        form.setFocus('role_name');
      }, 100);

      return () => {
        clearTimeout(timerId);
      };
    }
  }, [form, isInsertSuccess, onSuccess]);

  React.useEffect(() => {
    if (insertError) {
      const axiosError = insertError as AxiosError;
      toast.warning('Tambah Peran', {
        description: `Gagal menambahkan peran. ${(axiosError?.response?.data as { message: string })?.message ?? 'unknown error'}`,
      });
    }
  }, [insertError]);

  return (
    <Dialog {...props}>
      <DialogContent className='mx-auto max-h-[85vh] max-w-[90%] overflow-scroll px-4 py-6 md:px-6 md:py-6 lg:max-w-[60%]'>
        <DialogHeader>
          <DialogTitle className='flex items-center justify-between'>
            <p className='text-md-bold lg:text-xl-bold text-left'>
              Tambah Peran
            </p>
          </DialogTitle>
          <DialogDescription className='hidden' />
          <DialogBody className='lg:text-md-regular text-sm-regular relative border-0 text-left'>
            <div className='lg:text-md-regular text-sm-regular text-left'>
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
                              render={({ field }) => (
                                <FormItem
                                  key={menu}
                                  className='flex items-center gap-3'
                                >
                                  <FormControl>
                                    <Checkbox
                                      disabled={isPending}
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
                              )}
                            />
                          ))}
                        </div>
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

export default AddRoleDialog;
