import { zodResolver } from '@hookform/resolvers/zod';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { BeatLoader } from 'react-spinners';
import { z } from 'zod';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { cn, formatNumberFromString } from '@/lib/utils';

import { Button } from '../../ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog';
import { useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { useGetShift, useGetShiftKasir } from '@/hooks/shift-kasir/useGetShift';
import { setCashierStatus, setShiftId } from '@/redux/ui-slice';
import {
  CreateShiftParams,
  useCreateShift,
} from '@/hooks/shift-kasir/useCreateShift';
import {
  CloseShiftParams,
  useCloseShift,
} from '@/hooks/shift-kasir/useCloseShift';
import { toast } from 'sonner';

const formSchema = z.object({
  balance: z.string().min(1, 'tidak boleh kosong'),
});

export type FormData = z.infer<typeof formSchema>;

interface FormStatusDialogProps extends React.ComponentProps<typeof Dialog> {
  onConfirm: () => void;
  onCancel?: () => void;
  confirmBtnText?: string;
  editId: string;
}

const EditShiftDialog: React.FC<FormStatusDialogProps> = ({
  onConfirm,
  onCancel,
  confirmBtnText = 'Hapus',
  editId,
  ...props
}) => {
  const [enableEditing, setEnableEditing] = React.useState(false);
  const [cashierStatus, setCashierStatus] = useState('closed');
  const shiftId = editId;
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      balance: '0',
    },
  });

  const {
    mutate: closeShiftFn,
    isPending: isClosing,
    isSuccess: closingSuccess,
  } = useCloseShift();

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    form.setValue('balance', formatNumberFromString(rawValue));
  };

  function handlePendingClose() {
    // e.preventDefault();
    const data = form.getValues();
    const newData: CloseShiftParams = {
      shift_id: shiftId || '',
      balance: parseInt(data.balance.replace(/\D/g, '')),
      closing_status: 'pending_close',
    };
    closeShiftFn(newData);
  }

  function handleSubmit(data: FormData) {
    if (!enableEditing) {
      toast.warning('Shift ini sudah ditutup');
      return;
    }
    if (cashierStatus !== 'closed') {
      const newData: CloseShiftParams = {
        shift_id: shiftId || '',
        balance: parseInt(data.balance.replace(/\D/g, '')),
        closing_status: 'closed',
      };
      closeShiftFn(newData);
    } else if (cashierStatus === 'closed') {
      props.onOpenChange?.(false);
    }
  }

  useEffect(() => {
    if (closingSuccess) {
      form.reset();
      props.onOpenChange?.(false);
    }
  }, [closingSuccess]);

  const {
    data: dataShift,
    isPending: shiftLoading,
    mutate: getShiftFn,
  } = useGetShift();

  useEffect(() => {
    if (props.open) {
      getShiftFn({
        dataId: shiftId,
      });
    }
  }, [props.open]);

  useEffect(() => {
    if (dataShift) {
      setCashierStatus(dataShift.data.closing_status);
      form.setValue(
        'balance',
        formatNumberFromString(
          (dataShift?.data?.closing_balance || 0).toString()
        )
      );
      if (dataShift.data.closing_status === 'closed') {
        const closedAt = format(
          parseISO(dataShift.data.closed_at),
          'dd MMM yyyy HH:mm',
          { locale: id }
        );

        toast.info(`Shift ini sudah ditutup pada ${closedAt}`);
        setEnableEditing(false);
      } else {
        setEnableEditing(true);
      }
    }
  }, [dataShift]);

  return (
    <Dialog {...props}>
      <DialogContent className='mx-auto max-h-[85vh] max-w-[90%] overflow-scroll px-4 py-6 md:px-6 md:py-6 lg:max-w-[50%]'>
        <DialogHeader>
          <DialogTitle className='flex items-center justify-between'>
            <p className='text-md-bold lg:text-xl-bold text-left'>
              Tutup Shift
            </p>
          </DialogTitle>
          <DialogDescription className='text-xs'>
            ID: {shiftId}
          </DialogDescription>
          <DialogBody className='lg:text-md-regular text-sm-regular relative flex flex-col border-0 text-left'>
            {shiftLoading && (
              <div className='bg-background absolute inset-0 top-0 z-100 flex h-full w-full flex-col items-center justify-center'>
                <BeatLoader color='#a3ced0' />
                <span className='text-xs md:text-sm'>memuat data...</span>
              </div>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <FormField
                  control={form.control}
                  name='balance'
                  render={({ field }) => (
                    <FormItem className='flex-center mt-4 flex-col gap-2'>
                      <FormLabel className='lg:text-md text-sm'>
                        {cashierStatus !== 'closed' ? 'Closing ' : 'Opening '}
                        Balance:
                      </FormLabel>
                      <p className='md:text:sm text-xs'>
                        Masukan jumlah uang yang ada di laci kasir
                      </p>
                      <div>
                        <div className='relative'>
                          <span className='absolute inset-0 flex w-fit items-center pl-2 text-2xl font-semibold'>
                            Rp
                          </span>
                          <Input
                            {...field}
                            name='balance'
                            className={cn(
                              'size-12 w-full text-center text-2xl font-bold md:text-2xl lg:text-3xl',
                              form.formState.errors?.balance
                                ? 'border-destructive'
                                : ''
                            )}
                            autoComplete='off'
                            disabled={isClosing || !enableEditing}
                            type='text'
                            value={field.value ? field.value : ''}
                            onChange={handleNumberChange}
                          />
                        </div>
                        <FormMessage />
                        <div className='mt-6 flex flex-col items-center justify-end gap-4'>
                          <Button
                            type='submit'
                            className='w-full'
                            disabled={isClosing || !enableEditing}
                            variant='default'
                          >
                            {isClosing ? (
                              <BeatLoader color='#d5d7da' size={10} />
                            ) : (
                              `Tutup Kasir`
                            )}
                          </Button>
                          {/* {cashierStatus !== 'pending_close' && ( */}
                          <Button
                            disabled={isClosing || !enableEditing}
                            variant='ghost'
                            type='button'
                            className='text-xs-semibold lg:text-sm-semibold w-full px-4'
                            onClick={handlePendingClose}
                          >
                            {isClosing ? (
                              <BeatLoader color='#d5d7da' size={10} />
                            ) : (
                              'Tutup Sekarang, Input Balance Nanti'
                            )}
                          </Button>
                          {/* )} */}
                        </div>
                      </div>
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </DialogBody>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default EditShiftDialog;
