/**
 * @file products.ts
 * @description Type definitions for Product-related data structures.
 */

/** Represents a category associated with a product. */
export type Category = {
  name: string;
  description: string;
  slug: string;
  id: string;
};

/** Represents a variant of a product with its options. */
export type ProductVariant = {
  variantName: string;
  variantOptions: string[];
};

/** Represents the details of a product variant, including price and quantity. */
export type ProductVariantDetail = {
  price: number;
  quantity: number;
  attributes: Record<string, string>;
};

/** Represents a product in the database or application. */
export type Product = {
  name: string;
  sku: string;
  slug: string;
  category: Category;
  description: string;
  variants: ProductVariant[];
  variantDetails: ProductVariantDetail[];
  stock: number;
  isActive: boolean;
  isArchived: boolean;
  id: string;
};
