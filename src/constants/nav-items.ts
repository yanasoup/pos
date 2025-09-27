import {
  Box,
  UsersRound,
  Blocks,
  ShoppingBasket,
  ShoppingCart,
  ChartNoAxesCombined,
  Settings,
  ScanBarcode,
  Package2,
  Users,
  UserRoundCog,
  Shuffle,
} from 'lucide-react';

export type NavItem = {
  title: string;
  url: string;
  icon: any;
};

export type POSMenu = {
  [key: string]: { items: NavItem[] };
};

export const navPosItems: POSMenu = {
  navDashboard: {
    items: [
      {
        title: 'Ringkasan',
        url: '/',
        icon: ChartNoAxesCombined,
      },
    ],
  },
  navMaster: {
    items: [
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
        title: 'Item',
        url: '/inventori',
        icon: Box,
      },
    ],
  },
  navTransaksi: {
    items: [
      {
        title: 'Penjualan Kasir',
        url: '/penjualan-kasir',
        icon: ScanBarcode,
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
    ],
  },
  navMonitoring: {
    items: [
      {
        title: 'Stok',
        url: '/stok',
        icon: Package2,
      },
      {
        title: 'Shift',
        url: '/shift-kasir',
        icon: Shuffle,
      },
    ],
  },
  navLaporan: {
    items: [
      {
        title: 'Pembelian',
        url: '/laporan-pembelian',
        icon: ShoppingBasket,
      },
      {
        title: 'Penjualan',
        url: '/laporan-penjualan',
        icon: ShoppingCart,
      },
    ],
  },
  navAdmin: {
    items: [
      {
        title: 'Manajemen Peran User',
        url: '/manajemen-peran',
        icon: UserRoundCog,
      },
      {
        title: 'Manajemen User',
        url: '/manajemen-user',
        icon: Users,
      },
    ],
  },
  navSecondary: {
    items: [
      {
        title: 'Setting',
        url: '#',
        icon: Settings,
      },
      {
        title: 'Dashboard Demo',
        url: '/demo',
        icon: ChartNoAxesCombined,
      },
    ],
  },
};

export function getUrls(data: POSMenu) {
  let urls: string[] = [];

  function extractUrls(items: POSMenu | { items: NavItem[] } | NavItem[]) {
    if (Array.isArray(items)) {
      items.forEach((item) => {
        if (item.url) {
          urls.push(item.url);
        }
      });
    } else if ('items' in items) {
      // object dengan property "items"
      extractUrls(items.items);
    } else {
      // POSMenu
      Object.values(items).forEach((section) => {
        extractUrls(section);
      });
    }
  }

  extractUrls(data);
  return urls;
}
export const extractedMenuUrls = getUrls(navPosItems);

export function filterNavItems(
  navItems: POSMenu,
  grantedMenus: string[]
): POSMenu {
  const filtered: POSMenu = {};

  Object.entries(navItems).forEach(([sectionKey, sectionValue]) => {
    const filteredItems = sectionValue.items.filter((item) =>
      grantedMenus.includes(item.url)
    );

    if (filteredItems.length > 0) {
      filtered[sectionKey] = {
        items: filteredItems,
      };
    }
  });

  return filtered;
}

const getSession = async () => {
  const response = await fetch('/api/session');
  const data = await response.json();
  const grantedMenus = await JSON.parse(data.session);
  const tmpFilteredNavItems = filterNavItems(navPosItems, grantedMenus);

  return tmpFilteredNavItems;
};

export const filteredNavItems = await getSession();

// console.log('filteredNavItems', filteredNavItems);
