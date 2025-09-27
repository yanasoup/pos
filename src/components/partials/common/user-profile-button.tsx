'use client';
import { Icon } from '@iconify-icon/react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSidebar } from '@/components/ui/sidebar';

import { cn } from '@/lib/utils';
import type { RootState } from '@/redux/store';
import { resetState } from '@/redux/ui-slice';

import UserBadge from './user-badge';
import OpenCashierDialog from '../penjualan-kasir/open-cashier-dialog';

type UserProfileButtonProps = {
  onLogout: () => void;
  className?: string;
};
const UserProfileButton: React.FC<UserProfileButtonProps> = ({
  onLogout,
  className,
}) => {
  const uiuxState = useSelector((state: RootState) => state.uiux);

  const logoutHandler = () => {
    onLogout();
  };
  // const isLargeIsh = useMedia('(min-width: 1024px', false);
  const router = useRouter();
  const dispatch = useDispatch();

  React.useEffect(() => {
    if (uiuxState.isLoggedOut) {
      dispatch(resetState());
      router.push('/login');
    }
  }, [uiuxState.isLoggedOut, dispatch, router]);

  const { open } = useSidebar();

  return (
    <>
      <UserDropdownMenu onLogout={logoutHandler}>
        <div className='flex w-fit cursor-pointer flex-row gap-2 max-md:hidden lg:w-fit lg:items-center'>
          <UserBadge size={open ? 12 : 12} className='grayscale-90' />
          {/* {open && ( */}
          <div className='flex flex-1 flex-col justify-center max-xl:hidden'>
            <span className={cn('text-xs-medium md:text-sm-medium', className)}>
              {uiuxState.authUser?.name}
            </span>
            <span className={cn('text-xs md:text-sm')}>
              {uiuxState.authUser?.email}
            </span>
          </div>
          {/* )} */}
        </div>
      </UserDropdownMenu>
    </>
  );
};

type UserDropdownMenuProps = {
  children: React.ReactNode;
  onLogout: () => void;
};

export const UserDropdownMenu: React.FC<UserDropdownMenuProps> = ({
  children,
  onLogout,
}: UserDropdownMenuProps) => {
  const router = useRouter();
  const cashierStatus = useSelector(
    (state: RootState) => state.uiux.cashierStatus
  );
  const [showOpenCashierDialog, setShowOpenCashierDialog] =
    React.useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent
          className='bg-primary-400 border-[0.25]'
          align='start'
        >
          <DropdownMenuItem
            className='item-center focus:bg-primary-200 flex cursor-pointer justify-start border-0 text-xs text-white opacity-75 focus:text-white lg:text-sm'
            onClick={() => setShowOpenCashierDialog(true)}
          >
            <Icon
              icon={
                cashierStatus === 'open'
                  ? 'material-symbols:left-panel-close-sharp'
                  : 'material-symbols:right-panel-close-sharp'
              }
              className='flex-center'
            />
            {cashierStatus === 'open' ? 'Tutup Kasir' : 'Buka  Kasir'}
          </DropdownMenuItem>
          <DropdownMenuItem
            className='item-center focus:bg-primary-200 flex cursor-pointer justify-start text-xs text-white opacity-75 focus:text-white lg:text-sm'
            onClick={onLogout}
          >
            <Icon icon='bx:log-out-circle' className='flex-center rotate-180' />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <OpenCashierDialog
        onConfirm={() => {}}
        onCancel={() => {}}
        open={showOpenCashierDialog}
        onOpenChange={setShowOpenCashierDialog}
        confirmBtnText='Simpan'
      />
    </>
  );
};

export default UserProfileButton;
