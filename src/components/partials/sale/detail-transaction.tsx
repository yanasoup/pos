'use client';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { XIcon } from 'lucide-react';
import React from 'react';
import { useSelector } from 'react-redux';
import { BeatLoader } from 'react-spinners';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { UseGetPurchaseDetailsParams } from '@/hooks/purchase/useGetPurchaseDetail';
import { useGetSaleDetails } from '@/hooks/sale/useGetTransaction';
import { formatNumber } from '@/lib/utils';
import { RootState } from '@/redux/store';

import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogFooter,
  DialogHeader,
} from '../../ui/dialog';

interface DialogProps extends React.ComponentProps<typeof Dialog> {
  masterId: string | number;
}

const SaleDetailDialog: React.FC<DialogProps> = ({ masterId, ...props }) => {
  const uiuxState = useSelector((state: RootState) => state.uiux);

  const invalidateQueryParams: UseGetPurchaseDetailsParams = [
    'sale-details',
    {
      masterId: masterId,
      limit: 1000,
      page: 1,
      queryString: '',
    },
    uiuxState.apiToken!,
  ];

  const { data: saleData, isLoading } = useGetSaleDetails(
    invalidateQueryParams
  );

  return (
    <Dialog {...props}>
      <DialogContent className='mx-auto max-h-[85vh] max-w-[90%] overflow-scroll px-4 py-6 md:px-6 md:py-6 lg:max-w-[60%]'>
        <DialogHeader>
          <DialogTitle className='flex items-center justify-between'>
            <p className='text-md-bold lg:text-xl-bold text-left'>
              Detail Transaksi
            </p>
          </DialogTitle>
          <DialogDescription className='hidden' />
          <DialogBody className='lg:text-md-regular text-sm-regular relative flex flex-col border-0 text-left'>
            {isLoading && (
              <div className='flex-center bg-background absolute inset-0 z-100 flex h-full w-full flex-col'>
                <span className='text-xs lg:text-sm'>
                  {isLoading ? 'memuat data...' : 'menyimpan data...'}
                </span>
                <BeatLoader color='#d5d7da' size={10} />
              </div>
            )}

            <div className='flex flex-col flex-wrap gap-1 rounded-tl-md rounded-tr-md border p-2 pb-6 md:flex-row lg:gap-4'>
              <div className='flex flex-2 flex-col gap-1'>
                <div className='flex flex-1 flex-col'>
                  <div className='text-xs lg:text-xs'>No. Pembelian:</div>
                  <Input
                    className='w-full'
                    value={saleData?.data[0].sale_no || ''}
                    readOnly
                  />
                </div>
                <div className='flex flex-1 flex-col'>
                  <div className='text-xs lg:text-xs'>Tanggal Pembelian:</div>
                  <Input
                    className='w-full text-xs lg:text-xs'
                    value={
                      saleData
                        ? format(saleData?.data[0].sale_date, 'dd MMM yyyy', {
                            locale: id,
                          })
                        : ''
                    }
                    readOnly
                  />
                </div>
              </div>
              <div className='flex flex-3 flex-wrap'>
                <div className='flex w-full flex-col'>
                  <div className='text-xs lg:text-xs'>Pelanggan:</div>
                  <Input
                    className='w-full text-xs lg:text-xs'
                    value={saleData?.data[0].customer || ''}
                    readOnly
                  />
                </div>
                <div className='flex w-full flex-col'>
                  <div className='text-xs lg:text-xs'>Catatan:</div>
                  <span className='text-xs lg:text-xs'>
                    {saleData?.data[0].notes || '-'}
                  </span>
                </div>
              </div>
            </div>

            <div className='mt-4 px-0 py-1 text-xs lg:text-xs'>
              Item yang dibeli:
            </div>
            <table className='h-full w-full border-collapse overflow-auto border'>
              <thead>
                <tr className='bg-muted'>
                  <th className='font-regular sticky top-0 border p-2 text-center text-xs lg:text-xs'>
                    No
                  </th>
                  <th className='font-regular sticky top-0 border p-2 text-left text-xs lg:text-xs'>
                    Nama Barang
                  </th>
                  <th className='font-regular sticky top-0 border p-2 text-center text-xs lg:text-xs'>
                    Harga
                  </th>
                  <th className='font-regular sticky top-0 border p-2 text-center text-xs lg:text-xs'>
                    Qty
                  </th>
                  <th className='font-regular sticky top-0 border p-2 text-right text-xs lg:text-xs'>
                    Total Harga
                  </th>
                </tr>
              </thead>
              <tbody>
                {saleData?.data.map((item, index) => (
                  <tr key={index} className='hover:cursor-pointer'>
                    <td className='border px-2 py-1 text-center text-xs lg:text-xs'>
                      {index + 1}
                    </td>
                    <td className='border px-2 py-1 text-left text-xs lg:text-xs'>
                      {item.product_name}
                    </td>
                    <td className='border px-2 py-1 text-center text-xs lg:text-xs'>
                      {formatNumber(item.price || 0)}
                    </td>
                    <td className='border px-2 py-1 text-center text-xs lg:text-xs'>
                      {formatNumber(item.qty || 0)}
                    </td>
                    <td className='border px-2 py-1 text-right text-xs lg:text-xs'>
                      {formatNumber(item.qty * item.price || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className='bg-muted hover:cursor-pointer'>
                  <td
                    colSpan={3}
                    className='sticky bottom-0 border p-2 text-left text-xs lg:text-xs'
                  >
                    Total : {saleData?.data.length} item
                  </td>
                  <td className='sticky bottom-0 border p-2 text-center text-xs lg:text-xs'>
                    {formatNumber(
                      saleData?.data.reduce((acc, item) => acc + item.qty, 0) ||
                        0
                    )}
                  </td>
                  <td className='sticky bottom-0 border p-2 text-right text-xs lg:text-xs'>
                    {formatNumber(
                      saleData?.data.reduce(
                        (acc, item) => acc + item.qty * item.price,
                        0
                      ) || 0
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </DialogBody>
          <DialogFooter className='mt-2 flex-1 items-end text-right'>
            <DialogClose asChild>
              <Button variant='default' size='sm'>
                Selesai
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default SaleDetailDialog;
