import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { v4 as uuidv4 } from 'uuid';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
  tenant_id: number;
  tenant_name?: string;
  tenant_description?: string;
  avatar?: string;
};

export type SaleCartItem = {
  product_id: string;
  product_code: string;
  product_name: string;
  qty: number;
  price: number;
  price_cogs: number;
  pd_id?: string;
  discount?: number;
};
export type PurchaseCart = {
  master: {
    purchase_id: string;
    purchase_no: string;
    purchase_date: string;
    supplier_id: string;
    supplier?: string;
    notes?: string;
    isAutoPriceCheck: boolean;
    rate_harga_jual: number;
  };
  detail: SaleCartItem[];
};
export type PurchaseCartItem = {
  master: Omit<PurchaseCart['master'], 'purchase_id'>;
  detail: SaleCartItem;
};
type SaleCart = {
  master: {
    shift_id: string;
    sale_no: string;
    sale_date: string;
  };
  detail: SaleCartItem[];
};

type UIUXState = {
  apiToken: string | null;
  isAuthenticated: boolean;
  authUser: (AuthUser & { headline?: string }) | null;
  isLoggedOut: boolean;
  currentSearchTerm: string;
  purchaseCart: PurchaseCart;
  purchaseCartEdit: PurchaseCart;
  saleCart: SaleCart;
  isSidebarOpen: boolean;
  showBlockLoader: boolean;
  cashierStatus: 'open' | 'pending_close' | 'closed';
  shiftId: string;
};

const initialState: UIUXState = {
  apiToken: null,
  isAuthenticated: false,
  authUser: null,
  isLoggedOut: false,
  currentSearchTerm: '',
  cashierStatus: 'open',
  purchaseCart: {
    master: {
      purchase_id: '',
      purchase_no: '',
      purchase_date: '',
      supplier_id: '',
      supplier: '',
      notes: '',
      isAutoPriceCheck: true,
      rate_harga_jual: 0,
    },
    detail: [],
  },
  purchaseCartEdit: {
    master: {
      purchase_id: '',
      purchase_no: '',
      purchase_date: '',
      supplier_id: '',
      supplier: '',
      notes: '',
      isAutoPriceCheck: true,
      rate_harga_jual: 0,
    },
    detail: [],
  },
  saleCart: {
    master: {
      shift_id: '',
      sale_no: '',
      sale_date: '',
    },
    detail: [],
  },
  isSidebarOpen: true,
  showBlockLoader: false,
  shiftId: '',
};

const UIUXSlice = createSlice({
  name: 'uiux',
  initialState,
  reducers: {
    setAuthenticated: (
      state,
      action: PayloadAction<{ authUser: AuthUser; apiToken: string }>
    ) => {
      state.isAuthenticated = true;
      state.authUser = action.payload.authUser;
      state.apiToken = action.payload.apiToken;
    },
    setAuthUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.authUser = action.payload;
    },
    setAuthToken: (state, action: PayloadAction<string>) => {
      state.apiToken = action.payload;
    },
    setUnauthenticated: (state, action: PayloadAction<boolean>) => {
      state.isLoggedOut = action.payload;
    },
    setCashierStatus: (
      state,
      action: PayloadAction<'open' | 'pending_close' | 'closed'>
    ) => {
      state.cashierStatus = action.payload;
    },
    setShiftId: (state, action: PayloadAction<string>) => {
      state.shiftId = action.payload;
    },
    addToPurchaseCart: (state, action: PayloadAction<PurchaseCartItem>) => {
      const masterCart = state.purchaseCart.master;
      if (masterCart.purchase_id === '') {
        masterCart.purchase_id = uuidv4();
      }
      masterCart.purchase_no = action.payload.master.purchase_no;
      masterCart.purchase_date = action.payload.master.purchase_date;
      masterCart.supplier_id = action.payload.master.supplier_id;
      masterCart.notes = action.payload.master.notes;
      masterCart.isAutoPriceCheck = action.payload.master.isAutoPriceCheck;
      masterCart.rate_harga_jual = action.payload.master.rate_harga_jual;

      const newItem = action.payload.detail;

      if (state.purchaseCart.detail.length === 0) {
        state.purchaseCart.detail.push(newItem);
        return;
      }

      const existingItem = state.purchaseCart.detail.find(
        (item) => item.product_id === newItem.product_id
      ) as SaleCartItem;

      if (!existingItem) {
        state.purchaseCart.detail.push(newItem);
      } else {
        existingItem.price = newItem.price;
        existingItem.price_cogs = newItem.price_cogs;
        existingItem.qty += newItem.qty;
      }
    },
    updateMasterPurchaseCart: (
      state,
      action: PayloadAction<PurchaseCart['master']>
    ) => {
      state.purchaseCart.master = action.payload;
    },
    removeFromPurchaseCart: (state, action: PayloadAction<string>) => {
      state.purchaseCart.detail = state.purchaseCart.detail.filter(
        (item) => item.product_id !== action.payload
      );
    },
    updatePurchaseCart: (state, action: PayloadAction<PurchaseCartItem>) => {
      const newItem = action.payload.detail;
      state.purchaseCart.detail = state.purchaseCart.detail.filter(
        (item) => item.product_code !== newItem.product_code
      );
      state.purchaseCart.detail.push(newItem);
    },
    resetPurchaseCart: (state) => {
      const purchaseCart = state.purchaseCart;

      purchaseCart.master = {
        purchase_id: '',
        purchase_no: '',
        purchase_date: format(new Date(), 'yyyy-MM-dd', { locale: id }),
        supplier_id: '',
        notes: '',
        isAutoPriceCheck: true,
        rate_harga_jual: 0,
      };
      purchaseCart.detail = [];
    },
    setPurchaseCartEdit: (state, action: PayloadAction<PurchaseCart>) => {
      state.purchaseCartEdit = action.payload;
    },
    addToPurchaseCartEdit: (state, action: PayloadAction<PurchaseCartItem>) => {
      const masterCart = state.purchaseCartEdit.master;
      if (masterCart.purchase_id === '') {
        masterCart.purchase_id = uuidv4();
      }
      masterCart.purchase_no = action.payload.master.purchase_no;
      masterCart.purchase_date = action.payload.master.purchase_date;
      masterCart.supplier_id = action.payload.master.supplier_id;
      masterCart.notes = action.payload.master.notes;
      masterCart.isAutoPriceCheck = action.payload.master.isAutoPriceCheck;
      masterCart.rate_harga_jual = action.payload.master.rate_harga_jual;

      const newItem = action.payload.detail;

      if (state.purchaseCartEdit.detail.length === 0) {
        state.purchaseCartEdit.detail.push(newItem);
        return;
      }

      const existingItem = state.purchaseCartEdit.detail.find(
        (item) => item.product_id === newItem.product_id
      ) as SaleCartItem;

      if (!existingItem) {
        state.purchaseCartEdit.detail.push(newItem);
      } else {
        existingItem.price = newItem.price;
        existingItem.qty += newItem.qty;
      }
    },
    updateMasterPurchaseCartEdit: (
      state,
      action: PayloadAction<PurchaseCart['master']>
    ) => {
      state.purchaseCartEdit.master = action.payload;
    },
    removeFromPurchaseCartEdit: (state, action: PayloadAction<string>) => {
      state.purchaseCartEdit.detail = state.purchaseCartEdit.detail.filter(
        (item) => item.product_id !== action.payload
      );
    },
    updatePurchaseCartEdit: (
      state,
      action: PayloadAction<PurchaseCartItem>
    ) => {
      const newItem = action.payload.detail;
      state.purchaseCartEdit.detail = state.purchaseCartEdit.detail.filter(
        (item) => item.product_code !== newItem.product_code
      );
      state.purchaseCartEdit.detail.push(newItem);
    },
    resetPurchaseCartEdit: (state) => {
      const purchaseCart = state.purchaseCartEdit;

      purchaseCart.master = {
        purchase_id: '',
        purchase_no: '',
        purchase_date: format(new Date(), 'yyyy-MM-dd', { locale: id }),
        supplier_id: '',
        notes: '',
        isAutoPriceCheck: true,
        rate_harga_jual: 0,
      };
      purchaseCart.detail = [];
    },

    addToSaleCart: (state, action: PayloadAction<SaleCartItem>) => {
      const masterCart = state.saleCart.master;
      if (masterCart.sale_no === '') {
        // masterCart.sale_no = uuidv4();
        masterCart.sale_date = format(new Date(), 'yyyy-MM-dd', { locale: id });
      }
      masterCart.shift_id = state.shiftId;
      masterCart.sale_no = uuidv4();

      const newItem = action.payload;

      if (state.saleCart.detail.length === 0) {
        state.saleCart.detail.push(newItem);
        return;
      }

      const existingItem = state.saleCart.detail.find(
        (item) => item.product_id === newItem.product_id
      ) as SaleCartItem;

      if (!existingItem) {
        state.saleCart.detail.push(newItem);
      } else {
        existingItem.price = newItem.price;
        existingItem.qty += newItem.qty;
      }
    },
    removeFromSaleCart: (state, action: PayloadAction<string>) => {
      state.saleCart.detail = state.saleCart.detail.filter(
        (item) => item.product_id !== action.payload
      );
    },
    updateSaleCart: (state, action: PayloadAction<SaleCartItem>) => {
      const newItem = action.payload;
      state.saleCart.detail = state.saleCart.detail.filter(
        (item) => item.product_code !== newItem.product_code
      );
      state.saleCart.detail.push(newItem);
    },

    resetCart: (state) => {
      const saleCart = state.saleCart;

      saleCart.master = {
        shift_id: '',
        sale_no: '',
        sale_date: format(new Date(), 'yyyy-MM-dd', { locale: id }),
      };
      saleCart.detail = [];
    },
    setSearchTerm(state, action: PayloadAction<string>) {
      state.currentSearchTerm = action.payload;
    },
    resetState: () => {
      return initialState;
    },
    setIsSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
    setShowBlockLoader: (state, action: PayloadAction<boolean>) => {
      state.showBlockLoader = action.payload;
    },
  },
});

export const {
  setAuthenticated,
  setAuthUser,
  setAuthToken,
  setUnauthenticated,
  addToPurchaseCart,
  updatePurchaseCart,
  removeFromPurchaseCart,
  updateMasterPurchaseCart,
  resetPurchaseCart,
  setPurchaseCartEdit,
  addToPurchaseCartEdit,
  updatePurchaseCartEdit,
  removeFromPurchaseCartEdit,
  updateMasterPurchaseCartEdit,
  resetPurchaseCartEdit,
  addToSaleCart,
  removeFromSaleCart,
  resetCart,
  resetState,
  setSearchTerm,
  setIsSidebarOpen,
  setShowBlockLoader,
  updateSaleCart,
  setCashierStatus,
  setShiftId,
} = UIUXSlice.actions;
export const uiUxReducer = UIUXSlice.reducer;
