'use client';
import {
  Box,
  UsersRound,
  Blocks,
  ShoppingBasket,
  ScanBarcode,
  Package2,
  ShoppingCart,
  FileChartColumnIncreasing,
  ChartNoAxesCombined,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { cn } from '@/lib/utils';
import { RootState } from '@/redux/store';
import { resetState } from '@/redux/ui-slice';

// Menu items.
const items = [
  {
    title: 'Ringkasan',
    url: '/',
    icon: ChartNoAxesCombined,
  },
  {
    title: 'Penjualan Kasir',
    url: '/penjualan-kasir',
    icon: ScanBarcode,
  },
  {
    title: 'Kategori',
    url: '/kategori',
    icon: Blocks,
  },
  {
    title: 'Pemasok',
    url: '/pemasok',
    icon: UsersRound,
  },
  {
    title: 'Daftar Item',
    url: '/inventori',
    icon: Box,
  },
  {
    title: 'Pembelian',
    url: '/pembelian',
    icon: ShoppingBasket,
  },
  {
    title: 'Penjualan',
    url: '/penjualan',
    icon: ShoppingCart,
  },
  {
    title: 'Stok',
    url: '/stok',
    icon: Package2,
  },
  {
    title: 'Laporan Pembelian',
    url: '/laporan-pembelian',
    icon: FileChartColumnIncreasing,
  },
  {
    title: 'Laporan Penjualan',
    url: '/laporan-penjualan',
    icon: FileChartColumnIncreasing,
  },
  // {
  //   title: 'Shift Kasir',
  //   url: '/shift-kasir',
  //   icon: UsersRound,
  // },
];
export const AppSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const uiuxState = useSelector((state: RootState) => state.uiux);

  const dispatch = useDispatch();

  React.useEffect(() => {
    if (uiuxState.isLoggedOut) {
      dispatch(resetState());
      router.push('/login');
    }
  }, [uiuxState.isLoggedOut, dispatch, router]);

  const { open: isSidebarOpened } = useSidebar();

  return (
    <Sidebar collapsible='icon'>
      <SidebarHeader>
        <SidebarGroupLabel className='lg:text-md flex h-14 items-center text-sm'>
          <Link href='/'>POS Retail v1.0</Link>
        </SidebarGroupLabel>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          {/* <SidebarGroupLabel className='lg:text-md flex h-14 items-center text-sm text-white'>
            POS Retail v0.1
          </SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive = pathname === item.url;
                if (!isSidebarOpened) {
                  return (
                    <Tooltip key={item.url}>
                      <TooltipTrigger asChild>
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton asChild>
                            <Link
                              href={item.url}
                              className={cn(
                                isActive
                                  ? 'text-sidebar-accent-foreground bg-sidebar-accent'
                                  : ''
                              )}
                            >
                              <item.icon />
                              <span>{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      </TooltipTrigger>
                      <TooltipContent side='right'>{item.title}</TooltipContent>
                    </Tooltip>
                  );
                } else {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <Link
                          href={item.url}
                          className={cn(
                            isActive
                              ? 'text-sidebar-accent-foreground bg-sidebar-accent'
                              : ''
                          )}
                        >
                          <item.icon />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className='flex flex-col gap-2 pb-4'>
        {/* <UserProfileButton onLogout={logoutHandler} /> */}
      </SidebarFooter>
    </Sidebar>
  );
};
