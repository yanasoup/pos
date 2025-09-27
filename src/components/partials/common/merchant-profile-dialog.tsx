import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosError } from 'axios';
import { XIcon } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { BeatLoader } from 'react-spinners';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogBody,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import {
  MerchantGetParams,
  UpdateMerchantParams,
  useGetMerchantProfile,
  useUpdateMerchant,
} from '@/hooks/profile/useMerchantProfile';
import { cn } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { AuthUser, setAuthUser } from '@/redux/ui-slice';

const formSchema = z.object({
  merchant_name: z.string().min(1, 'Nama warung tidak boleh kosong!'),
  description: z.string().min(1, 'Masukan deskripsi'),
});

export type FormData = z.infer<typeof formSchema>;

export type UpdateParam = {
  name: string;
  description: string;
};

interface DialogProps extends React.ComponentProps<typeof Dialog> {
  onSuccess: () => void;
}
const MerchantProfileDialog: React.FC<DialogProps> = ({
  onSuccess,
  ...props
}) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      merchant_name: '',
      description: '',
    },
  });
  const dispatch = useDispatch();
  const uiuxState = useSelector((state: RootState) => state.uiux);
  const queryKey: MerchantGetParams = [
    'merchant-profile',
    {
      enabled: uiuxState.apiToken !== null,
      requestToken: uiuxState.apiToken!,
    },
  ];
  const [getData, setGetData] = React.useState(false);
  const { data: merchantData, isLoading } = useGetMerchantProfile(queryKey);

  React.useEffect(() => {
    if (props.open) {
      setGetData(true);
    }
  }, [props.open]);

  React.useEffect(() => {
    if (merchantData) {
      form.setValue('merchant_name', merchantData?.data.name || '');
      form.setValue('description', merchantData?.data.description || '');
      // setGetData(false);
    }
  }, [getData, form, merchantData]);

  const {
    mutate: updateFn,
    isPending: updateLoading,
    error: updateError,
    isSuccess,
  } = useUpdateMerchant(queryKey);

  const handleSubmit = async (data: FormData) => {
    updateFn({
      data: {
        name: data.merchant_name,
        description: data.description,
      },
      requestToken: uiuxState.apiToken!,
    } as UpdateMerchantParams);
  };

  React.useEffect(() => {
    if (isSuccess) {
      const newAuthUserState: AuthUser = {
        id: uiuxState.authUser?.id || 0,
        name: uiuxState.authUser?.name || '',
        email: uiuxState.authUser?.email || '',
        tenant_id: uiuxState.authUser?.tenant_id || 0,
        tenant_name: form.getValues('merchant_name'),
        tenant_description: form.getValues('description'),
      };
      dispatch(setAuthUser(newAuthUserState));
      onSuccess();
    }
  }, [
    isSuccess,
    onSuccess,
    form,
    dispatch,
    uiuxState.authUser?.id,
    uiuxState.authUser?.name,
    uiuxState.authUser?.email,
    uiuxState.authUser?.tenant_id,
  ]);

  React.useEffect(() => {
    if (updateError) {
      const axiosError = updateError as AxiosError;
      let errMessages = 'Oops telah terjadi kesalahan. Silahkan hubungi admin.';
      if ([400, 401].includes(axiosError?.status || 500)) {
        errMessages = (axiosError?.response?.data as { message: string })
          ?.message;
      }
      toast.warning('Error', {
        description: errMessages,
      });
      form.setFocus('merchant_name');
    }
  }, [updateError, form]);

  return (
    <Dialog {...props}>
      <DialogContent className='mx-auto max-h-[85vh] max-w-[90%] overflow-scroll px-4 py-6 md:px-6 md:py-6 lg:w-150 lg:max-w-[60%]'>
        <DialogHeader>
          <DialogTitle className='flex items-center justify-between'>
            <p className='text-md-bold lg:text-xl-bold text-left'>
              Edit Profil Warung
            </p>
          </DialogTitle>
          <DialogDescription className='hidden'></DialogDescription>
          <DialogBody className='lg:text-md-regular text-sm-regular relative flex flex-col border-0 text-left'>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <FormField
                  control={form.control}
                  name='merchant_name'
                  render={({ field }) => (
                    <FormItem className='mt-2 gap-0'>
                      <FormLabel>Nama Warung</FormLabel>
                      <Input
                        {...field}
                        disabled={isLoading || updateLoading}
                        name='merchant_name'
                        className={cn(
                          form.formState.errors?.merchant_name
                            ? 'border-destructive'
                            : ''
                        )}
                        autoComplete='off'
                        type='text'
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
                        name='description'
                        className={cn(
                          form.formState.errors?.description
                            ? 'border-destructive'
                            : ''
                        )}
                        disabled={isLoading || updateLoading}
                        autoComplete='off'
                        type='text'
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='mt-5 text-right'>
                  <Button
                    disabled={isLoading || updateLoading}
                    variant='default'
                  >
                    {isLoading || updateLoading ? (
                      <BeatLoader size={10} />
                    ) : (
                      'Simpan'
                    )}
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

export default MerchantProfileDialog;
