'use client';

// import * as React from 'react';
import { IconInnerShadowTop } from '@tabler/icons-react';

import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavPOS } from './nav-pos';
import { useSelector } from 'react-redux';
import { filteredNavItems } from '@/constants/nav-items';
import { RootState } from '@/redux/store';
import type { AuthUser } from '@/redux/ui-slice';

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const authUser = useSelector((state: RootState) => state.uiux.authUser);

  return (
    <Sidebar collapsible='offcanvas' {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className='data-[slot=sidebar-menu-button]:!p-1.5'
            >
              <a href='#'>
                <IconInnerShadowTop className='!size-5' />
                <span className='text-base font-semibold'>POS Retail</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {filteredNavItems?.navDashboard?.items && (
          <NavPOS
            items={filteredNavItems?.navDashboard?.items || []}
            header='Dashboard'
          />
        )}
        {filteredNavItems?.navMaster?.items && (
          <NavPOS
            items={filteredNavItems?.navMaster?.items || []}
            header='Master'
          />
        )}
        {filteredNavItems?.navTransaksi?.items && (
          <NavPOS
            items={filteredNavItems?.navTransaksi?.items || []}
            header='Transaksi'
          />
        )}
        {filteredNavItems?.navMonitoring?.items && (
          <NavPOS
            items={filteredNavItems?.navMonitoring?.items || []}
            header='Monitoring'
          />
        )}
        {filteredNavItems?.navLaporan?.items && (
          <NavPOS
            items={filteredNavItems?.navLaporan?.items || []}
            header='Laporan'
          />
        )}
        {filteredNavItems?.navAdmin?.items && (
          <NavPOS
            items={filteredNavItems?.navAdmin?.items || []}
            header='Administrator'
          />
        )}
        {filteredNavItems?.NavSecondary?.items && (
          <NavPOS
            items={filteredNavItems?.NavSecondary?.items || []}
            header='Setting'
          />
        )}

        {/* <NavPOS items={navPosItems.navDashboard.items} header='Dashboard' />
        <NavPOS items={navPosItems.navMaster.items} header='Master' />
        <NavPOS items={navPosItems.navTransaksi.items} header='Transaksi' />
        <NavPOS items={navPosItems.navLaporan.items} header='Laporan' />
        <NavPOS items={navPosItems.navAdmin.items} header='Administrator' /> 
        <NavSecondary
          items={navPosItems.navSecondary.items}
          className='mt-auto'
        />*/}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={authUser as AuthUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
