/**
 * @file orders.ts
 * @description Type definitions and enumerations for Order-related data structures used across multiple workspaces.
 */

import { PaginatedResponse } from "./pagination";
import { Product } from "./products";
import { User } from "./users";

/** Enum for order status values. */
export enum OrderStatus {
  Pending = "pending",
  Processing = "processing",
  Completed = "completed",
  Cancelled = "cancelled",
}

/** Represents a product variant's attributes in an order item. */
export type VariantAttributes = {
  size: string;
  color: string;
};

/** Represents an item within an order. */
export type OrderItem = {
  product: Product;
  quantity: number;
  price: number;
  variantAttributes: VariantAttributes;
};

/** Represents the delivery details for an order. */
export type DeliveryDetails = {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  deliveryDate: string;
  deliveryInstructions?: string;
};

/** Represents the base structure of an order. */
export type Order = {
  customer: User;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  deliveryCost: number;
  deliveryDetails: DeliveryDetails;
  specialInstructions?: string;
  invoiceGenerated: boolean;
  isPaid: boolean;
  createdAt: string;
  updatedAt: string;
  id: string;
};

/** Represents single order response from api */
export type SingleOrderResponse = Order;

/** Represents all orders response with pagination from api */
export type AllOrdersPaginatedResponse = PaginatedResponse<Order>;
