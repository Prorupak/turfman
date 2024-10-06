export type SalesActivity = {
  totalSales: number;
  totalOrders: number;
};
export interface TopSellingItems {
  data: Datum[];
  page: number;
  perPage: number;
  total: number;
  totalPage: number;
}

export interface Datum {
  product: Product;
  totalUnitsSold: number;
  totalRevenue: number;
}

export interface Product {
  _id: string;
  name: string;
  sku: string;
  slug: string;
  category: string;
  subCategories: any[];
  tags: any[];
  description: string;
  variants: Variant[];
  variantDetails: VariantDetail[];
  stock: number;
  reservedStock: number;
  soldCount: number;
  isActive: boolean;
  availableFrom: Date;
  availableUntil: Date;
  relatedProducts: any[];
  isArchived: boolean;
  reviews: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface VariantDetail {
  price: number;
  quantity: number;
  attributes: Attributes;
}

export interface Attributes {
  size: string;
  color: string;
}

export interface Variant {
  variantName: string;
  variantOptions: string[];
}
