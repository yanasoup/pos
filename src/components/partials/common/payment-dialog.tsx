'use client';

import { zodResolver } from '@hookform/resolvers/zod';

import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { BeatLoader } from 'react-spinners';
import { z } from 'zod';

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { cn, formatNumber, formatNumberFromString } from '@/lib/utils';

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

const formSchema = z
  .object({
    jumlah_tagihan: z.string().min(1, 'tidak boleh kosong'),
    diskon_faktur: z.string().min(1, 'tidak boleh kosong!'),
    jumlah_bayar: z.string().min(1, 'tidak boleh kosong!'),
  })
  .superRefine((val, ctx) => {
    if (
      parseFloat(val.diskon_faktur.replace(/\D/g, '')) >
      parseFloat(val.jumlah_tagihan.replace(/\D/g, ''))
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Diskon melebihi jumlah tagihan!',
        path: ['diskon_faktur'],
      });
    }

    if (
      parseFloat(val.jumlah_bayar.replace(/\D/g, '')) <
      parseFloat(val.jumlah_tagihan.replace(/\D/g, '')) -
        Number(val.diskon_faktur.replace(/\D/g, ''))
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'Jumlah bayar kurang dari jumlah tagihan!',
        path: ['jumlah_bayar'],
      });
    }
  });

export type FormData = z.infer<typeof formSchema>;

interface FormStatusDialogProps extends React.ComponentProps<typeof Dialog> {
  onConfirm: (data: FormData) => void;
  onCancel?: () => void;
  showLoader?: boolean;
  confirmBtnText?: string;
  cancelBtnText?: string;
  jumlahTagihan: number;
  isSaveSuccess: boolean;
}

const MyPaymentDialog: React.FC<FormStatusDialogProps> = ({
  onConfirm,
  onCancel,
  showLoader,
  confirmBtnText = 'Hapus',
  cancelBtnText = 'Batal',
  jumlahTagihan = 0,
  isSaveSuccess = false,
  ...props
}) => {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jumlah_tagihan: formatNumber(jumlahTagihan),
      diskon_faktur: '0',
      jumlah_bayar: formatNumber(jumlahTagihan),
    },
  });
  const [kembalian, setKembalian] = useState<number>(0);
  const jumlahBayar = Number(form.watch('jumlah_bayar')?.replace(/\D/g, ''));
  const diskonRp = Number(form.watch('diskon_faktur')?.replace(/\D/g, ''));
  const jmlBayarRef = useRef<HTMLInputElement>(null);
  const [diskon, setDiskon] = useState(0);
  const [jumlahTagihanAfterDiskon, setJumlahTagihanAfterDiskon] =
    useState<number>(jumlahTagihan);

  React.useEffect(() => {
    // if (jumlahBayar && jumlahBayar >= jumlahTagihan - diskonRp) {
    setKembalian(jumlahBayar - (jumlahTagihan - diskonRp));
    // } else {
    // setKembalian(0);
    // setKembalian(jumlahBayar - (jumlahTagihan - diskonRp));
    // }
  }, [jumlahBayar, jumlahTagihan, diskonRp, form]);

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (e.target.name === 'jumlah_bayar') {
      form.setValue('jumlah_bayar', formatNumberFromString(rawValue));
    } else if (e.target.name === 'diskon_faktur') {
      form.setValue('diskon_faktur', formatNumberFromString(rawValue));
      setJumlahTagihanAfterDiskon(jumlahTagihan - Number(rawValue));
      if (Number(rawValue) >= jumlahTagihan) {
        form.setValue('jumlah_bayar', formatNumber(0));
      } else {
        form.setValue(
          'jumlah_bayar',
          formatNumber(jumlahTagihan - Number(rawValue))
        );
      }
    }
  };

  React.useEffect(() => {
    if (props.open) {
      form.reset();
      form.setValue('jumlah_tagihan', formatNumber(jumlahTagihan));
      setJumlahTagihanAfterDiskon(jumlahTagihan - diskon);
      form.setValue(
        'jumlah_bayar',
        formatNumberFromString(jumlahTagihan.toString())
      );

      form.setValue('diskon_faktur', formatNumber(diskon));
      form.setFocus('diskon_faktur');
    }
  }, [props.open, form, diskon, jumlahTagihan]);

  function handleSubmit(data: FormData) {
    onConfirm(data);
  }
  React.useEffect(() => {
    if (isSaveSuccess) {
      form.reset();
      setDiskon(0);
      form.setFocus('diskon_faktur');
    }
  }, [isSaveSuccess, form]);

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement>
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if ((e.target as HTMLInputElement).name === 'diskon_faktur') {
        form.setFocus('jumlah_bayar');
        jmlBayarRef.current?.focus();
        jmlBayarRef.current?.select();
      }
    }
  };

  return (
    <Dialog {...props}>
      <DialogContent className='mx-auto max-h-[85vh] max-w-[90%] overflow-scroll px-4 py-6 md:px-6 md:py-6 lg:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center justify-between'>
            <p className='text-md-bold lg:text-xl-bold text-left'>Pembayaran</p>
          </DialogTitle>
          <DialogDescription className='hidden' />
          <DialogBody className='lg:text-md-regular text-sm-regular relative flex flex-col border-0 text-left'>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)}>
                <div className='lg:text-md-regular text-sm-regular flex-center mt-6 flex-col gap-2 text-left'>
                  <p>Jumlah Tagihan:</p>
                  <p>
                    <span className='text-xl font-bold lg:text-xl'>
                      Rp{formatNumber(jumlahTagihan)}
                    </span>
                  </p>
                  <div className='hidden'>
                    <FormField
                      control={form.control}
                      name='jumlah_tagihan'
                      render={({ field }) => (
                        <FormItem className='flex-center mt-4 flex-col gap-2'>
                          <Input
                            {...field}
                            name='jumlah_tagihan'
                            className={cn(
                              'size-12 w-full text-center text-2xl font-bold md:text-2xl lg:text-3xl',
                              form.formState.errors?.jumlah_tagihan
                                ? 'border-destructive'
                                : ''
                            )}
                            autoComplete='off'
                            type='text'
                            value={field.value ? field.value : '0'}
                          />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name='diskon_faktur'
                  render={({ field }) => (
                    <FormItem className='flex-center mt-4 flex-col gap-2'>
                      <FormLabel className='lg:text-md text-sm'>
                        Diskon Faktur:
                      </FormLabel>
                      <div className='relative'>
                        <span className='absolute inset-0 flex w-fit items-center pl-2 text-2xl font-semibold'>
                          Rp
                        </span>
                        <Input
                          {...field}
                          name='diskon_faktur'
                          className={cn(
                            'size-12 w-full text-center text-2xl font-bold md:text-2xl lg:text-3xl',
                            form.formState.errors?.diskon_faktur
                              ? 'border-destructive'
                              : ''
                          )}
                          autoComplete='off'
                          disabled={showLoader}
                          type='text'
                          value={field.value ? field.value : ''}
                          onChange={handleNumberChange}
                          onKeyDown={handleKeyDown}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='lg:text-md-regular text-sm-regular flex-center mt-6 flex-col gap-2 text-left'>
                  <p>Jumlah Tagihan Setelah Diskon:</p>
                  <p>
                    <span className='text-ring text-2xl font-bold lg:text-3xl'>
                      Rp
                      {formatNumber(
                        jumlahTagihanAfterDiskon < 0
                          ? 0
                          : jumlahTagihanAfterDiskon
                      )}
                    </span>
                  </p>
                </div>

                <FormField
                  control={form.control}
                  name='jumlah_bayar'
                  render={({ field }) => (
                    <FormItem className='flex-center mt-4 flex-col gap-2'>
                      <FormLabel className='lg:text-md text-sm'>
                        Masukkan Jumlah Bayar :
                      </FormLabel>
                      <div className='relative'>
                        <span className='absolute inset-0 flex w-fit items-center pl-2 text-2xl font-semibold'>
                          Rp
                        </span>
                        <Input
                          {...field}
                          name='jumlah_bayar'
                          className={cn(
                            'size-12 w-full text-center text-2xl font-bold md:text-2xl lg:text-3xl',
                            form.formState.errors?.jumlah_bayar
                              ? 'border-destructive'
                              : ''
                          )}
                          ref={jmlBayarRef}
                          autoComplete='off'
                          disabled={showLoader}
                          type='text'
                          value={field.value ? field.value : ''}
                          onChange={handleNumberChange}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className='lg:text-md-regular text-sm-regular text-destructive flex flex-col py-6 text-center'>
                  <span>Kembali:</span>
                  <span
                    className={cn(
                      'text-xl font-bold lg:text-3xl',
                      kembalian < 0 ? 'text-destructive' : ''
                    )}
                  >
                    Rp{formatNumber(kembalian)}
                  </span>
                </div>

                <div className='mt-2 flex flex-col-reverse justify-end gap-2 md:flex-row'>
                  <DialogClose asChild>
                    <Button
                      disabled={showLoader}
                      variant='ghost'
                      className='text-xs-semibold lg:text-sm-semibold w-full md:w-fit'
                      onClick={onCancel}
                    >
                      {cancelBtnText}
                    </Button>
                  </DialogClose>

                  <Button disabled={showLoader} variant='default'>
                    {showLoader ? (
                      <BeatLoader color='#d5d7da' size={10} />
                    ) : (
                      `${confirmBtnText}`
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

export default MyPaymentDialog;
