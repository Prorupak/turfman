import {
  Category,
  Dashboard,
  Delivery,
  Products,
  Sales,
  SalesReturn,
} from "../components";

export const SIDEBAR_DATA = [
  {
    title: "Dashboard",
    icon: Dashboard,
    path: "/app/dashboard",
  },
  {
    icon: Products,
    title: "Products",
    path: "/products",
  },
  {
    icon: Category,
    title: "Categories",
    path: "/app/categories",
  },
  {
    icon: Sales,
    title: "Orders",
    path: "/app/orders",
  },
  {
    icon: Delivery,
    title: "Delivery",
    path: "/app/delivery",
  },
  {
    icon: SalesReturn,
    title: "Sales Returns",
    path: "/app/sales-returns",
  },
];
