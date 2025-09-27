'use client';

import { Pencil } from 'lucide-react';
import Image from 'next/image';
import React, { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { SidebarTrigger } from '@/components/ui/sidebar';

import { icons } from '@/constants/icons';
import { customAxios } from '@/lib/customAxios';
import { cn } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { setUnauthenticated } from '@/redux/ui-slice';

import MerchantProfileDialog from '../common/merchant-profile-dialog';
import UserProfileButton from '../common/user-profile-button';

const HeaderNavigation = ({
  showMerchantName = false,
  className,
}: {
  showMerchantName?: boolean;
  className?: string;
}) => {
  const [openMerchantProfile, setOpenMerchantProfile] = React.useState(false);
  const dispatch = useDispatch();
  const [, setIsLoading] = React.useState(false);
  const logoutHandler = async () => {
    setIsLoading(true);
    await customAxios
      .post(
        `/logout`,
        {},
        {
          withCredentials: true,
          withXSRFToken: true,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${uiuxState?.apiToken}`,
          },
        }
      )
      .then(function (response) {
        if (![200, 204].includes(response.status)) {
          throw new Error('Network response was not ok');
        }
        // dispatch(setUnauthenticated(true));
      })
      .catch(function () {
        // console.log('login error', error);
      })
      .finally(() => {
        dispatch(setUnauthenticated(true));
        setIsLoading(false);
        window.location.href = '/login';
      });
  };

  const uiuxState = useSelector((state: RootState) => state.uiux);

  const successHandler = useCallback(() => {
    setOpenMerchantProfile(false);
  }, []);

  const handleOpenChange = (open: boolean) => {
    setOpenMerchantProfile(open);
  };

  return (
    <div
      className={cn(
        // 'flex-between from-primary/5 to-card relative mb-4 flex w-full flex-col justify-start gap-4 rounded-3xl p-4 lg:flex-row lg:items-center lg:gap-0',
        'relative mb-4 flex flex-row items-center justify-center gap-2',
        className
      )}
    >
      <SidebarTrigger className='hover:bg-primary-300 text-primary-300 absolute top-2 right-2 z-10 hidden opacity-50 hover:text-white hover:opacity-90' />
      <div
        className={cn(
          'w-full flex-1 items-center justify-start gap-2 md:flex',
          showMerchantName ? 'flex' : 'hidden'
        )}
      >
        <div className='relative'>
          <div className='h-12 w-12'>
            <Image
              src={icons.merchant}
              className={cn(`size-full rounded-full object-contain`, className)}
              alt='merchant icon'
              width={600}
              height={600}
            />
          </div>
          <span
            className='flex-center absolute inset-0 rounded-full bg-neutral-800 text-center text-xs text-white opacity-0 hover:cursor-pointer hover:opacity-60 lg:text-sm'
            onClick={() => setOpenMerchantProfile(true)}
          >
            Edit
          </span>
          <Pencil
            onClick={() => {
              setOpenMerchantProfile(true);
            }}
            className='absolute right-0 -bottom-2 hidden size-4 cursor-pointer text-neutral-600'
          />
        </div>
        <div className='flex flex-col'>
          <h2
            className='text-xl font-semibold'
            style={{
              fontSize: 'clamp(1rem, 1.60vw, 1.25rem)',
            }}
          >
            {uiuxState?.authUser?.tenant_name || 'Nama Toko'}
          </h2>
          <p className='max-[400px]:text-xxs text-xs lg:text-sm'>
            {uiuxState?.authUser?.tenant_description || 'Alamat: '}
          </p>
        </div>
      </div>
      <UserProfileButton onLogout={logoutHandler} className='w-full' />
      <MerchantProfileDialog
        open={openMerchantProfile}
        onOpenChange={handleOpenChange}
        onSuccess={successHandler}
      />
    </div>
  );
};

export default HeaderNavigation;
