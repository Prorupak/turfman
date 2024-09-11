"use client";
import { LucideIcon } from "lucide-react";
import { ComponentType, SVGProps } from "react";

export { default as Category } from "./category";
export { default as Dashboard } from "./dashboard";
export { default as Delivery } from "./delivery";
export { default as Sales } from "./sales";
export { default as SalesReturn } from "./sales-return";

export type Icon = LucideIcon | ComponentType<SVGProps<SVGSVGElement>>;
