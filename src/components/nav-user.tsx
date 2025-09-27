'use client';

import {
  IconDotsVertical,
  IconLogout,
  IconUserCircle,
} from '@tabler/icons-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import type { AuthUser } from '@/redux/ui-slice';
import { setUnauthenticated } from '@/redux/ui-slice';
import { customAxios } from '@/lib/customAxios';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useState } from 'react';

export function NavUser({ user }: { user: AuthUser }) {
  const uiuxState = useSelector((state: RootState) => state.uiux);
  const { isMobile } = useSidebar();
  const dispatch = useDispatch();
  const [, setIsLoading] = useState(false);
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

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <Avatar className='h-8 w-8 rounded-lg grayscale'>
                <AvatarImage
                  src={user?.avatar ? user?.avatar : '/icons/icon-avatar.svg'}
                  alt={user?.name}
                />
                <AvatarFallback className='rounded-lg'>CN</AvatarFallback>
              </Avatar>
              <div className='grid flex-1 text-left text-sm leading-tight'>
                <span className='truncate font-medium'>{user?.name}</span>
                <span className='truncate text-xs'>{user?.email}</span>
              </div>
              <IconDotsVertical className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
            side={isMobile ? 'bottom' : 'right'}
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left text-sm'>
                <Avatar className='h-8 w-8 rounded-lg'>
                  <AvatarImage
                    src={user?.avatar ? user?.avatar : '/icons/icon-avatar.svg'}
                    alt={user?.name}
                  />
                  <AvatarFallback className='rounded-lg'>User</AvatarFallback>
                </Avatar>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>{user?.name}</span>
                  <span className='text-muted-foreground truncate text-xs'>
                    {user?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconUserCircle />
                Profile
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logoutHandler}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
