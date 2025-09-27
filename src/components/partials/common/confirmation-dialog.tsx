'use client';
import { XIcon } from 'lucide-react';
import React from 'react';
import { BeatLoader } from 'react-spinners';

import { Button } from '../../ui/button';
import {
  Dialog,
  DialogHeader,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '../../ui/dialog';

interface FormStatusDialogProps extends React.ComponentProps<typeof Dialog> {
  title: string;
  description: string;
  onConfirm: (id: number | string) => void;
  onCancel?: () => void;
  showLoader?: boolean;
  dataId?: string | number;
  confirmBtnText?: string;
  cancelBtnText?: string;
}

const MyConfirmationDialog: React.FC<FormStatusDialogProps> = ({
  title,
  description,
  onConfirm,
  onCancel,
  showLoader,
  dataId,
  confirmBtnText = 'Hapus',
  cancelBtnText = 'Batal',
  ...props
}) => {
  return (
    <Dialog {...props}>
      <DialogContent
        className='mx-auto overflow-scroll px-4 py-6 md:px-6 md:py-6'
        style={{
          width: 'clamp(20rem, 42.63vw, 33.25rem)',
        }}
      >
        <DialogHeader>
          <DialogTitle className='flex items-center justify-between'>
            <p className='text-md-bold lg:text-xl-bold text-left'>{title}</p>
          </DialogTitle>

          <div className='lg:text-md-regular text-sm-regular py-6 text-left'>
            {description}
          </div>

          <DialogDescription className='flex flex-col-reverse justify-end gap-2 md:flex-row'>
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
            <DialogClose asChild>
              <Button
                disabled={showLoader}
                onClick={() => onConfirm(dataId || -1)}
                variant='destructive'
                className='text-xs-semibold lg:text-sm-semibold text-neutral-25 w-full md:w-fit'
                autoFocus
              >
                {showLoader ? (
                  <BeatLoader
                    color='#d5d7da'
                    className='text-white'
                    size={10}
                  />
                ) : (
                  `${confirmBtnText}`
                )}
              </Button>
            </DialogClose>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default MyConfirmationDialog;
