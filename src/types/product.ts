export type ProductCategory = {
  id: string;
  name: string;
  tenant_id: number;
  created_at: string;
  updated_at: string;
  image_url: string;
};

export type Product = {
  id: string;
  product_code: string;
  name: string;
  unit: string;
  description: string;
  price: number;
  price_cogs: number;
  tenant_id: number;
  category_id: number;
  image_url: string;
  created_at: string;
  updated_at: string;
  category_name?: string;
  minimum_stock: number;
};

export const units = [
  'pcs',
  'kg',
  'liter',
  'batang',
  'sachet',
  'bungkus',
  'buah',
  'pak',
  'lusin',
  'ons',
  'botol',
  'lainnya',
].sort();

export const unitsObj = units.map((unit) => ({
  value: unit.toUpperCase(),
  label: unit.toUpperCase(),
}));

export type SelectOptions = {
  value: string;
  label: string;
};

export type PurchaseMaster = {
  id: string;
  tenant_id: number;
  purchase_no: string;
  purchase_date: Date;
  supplier: string;
  notes: string;
  created_by: number;
  updated_by: number;
  created_at: Date;
  updated_at: Date;
};
export type PurchaseMasterReturn = PurchaseMaster & {
  supplier_name: string;
  total_qty: number;
  total_price: number;
};

export type PurchaseDetail = {
  id: string;
  master_id: number;
  product_id: number;
  product_code: string;
  qty: number;
  price: number;
  sale_price: number;
  created_at: Date;
  updated_at: Date;
};

export type PurchaseDetailreturn = PurchaseDetail & {
  product_name: string;
};

export type Stock = {
  id: string;
  tenant_id: number;
  product_code: string;
  current_balance: number;
  created_at: Date;
  updated_at: Date;
};
export type StockProduct = Stock & {
  product_id: string;
  product_name: string;
  category_name: string;
  unit: string;
};

export type StockAPIReturn = {
  success: boolean;
  message: string;
  data: {
    data: StockProduct[];
    current_page: number;
    last_page: number;
    total: number;
    from: number;
    to: number;
  };
};

export type SaleMaster = {
  id: string;
  tenant_id: number;
  sale_no: string;
  sale_date: Date;
  customer: string;
  notes: string;
  created_by: number;
  updated_by: number;
  created_at: Date;
  updated_at: Date;
};
export type SaleMasterReturn = SaleMaster & {
  total_qty: number;
  total_price: number;
  invoice_discount?: number;
  gross_margin?: number;
};

export type SaleDetail = {
  id: string;
  master_id: number;
  product_id: number;
  product_code: string;
  qty: number;
  price: number;
  price_cogs: number;
  created_at: Date;
  updated_at: Date;
};

export type SaleDetailreturn = SaleDetail & {
  product_name: string;
};

export type PurchaseReportReturn = {
  purchase_no: string;
  purchase_date: Date;
  pd_id: string;
  supplier_id: string;
  supplier_name: string;
  product_id: string;
  qty: number;
  price: number;
  product_name: string;
  product_code: string;
  category_name: string;
};

export type SaleReportReturn = {
  sale_no: string;
  sale_date: Date;
  sd_id: string;
  customer: string;
  product_id: string;
  qty: number;
  price: number;
  price_cogs: number;
  product_name: string;
  product_code: string;
  category_name: string;
  invoice_discount: number;
  created_at?: Date;
};
