import { createContext, type ReactNode } from "react";

export type BreadcrumbItem = { readonly label: string; readonly to?: string };
export type BreadcrumbState =
	| { readonly kind: "trail"; readonly itemList: readonly BreadcrumbItem[] }
	| { readonly kind: "back"; readonly label: string; readonly to: string };
export type BreadcrumbLink = (item: {
	readonly to: string;
	readonly label: string;
}) => ReactNode;
export type BreadcrumbValue = {
	readonly state: BreadcrumbState;
	readonly renderLink?: BreadcrumbLink;
};
export const BreadcrumbContext = createContext<BreadcrumbValue | null>(null);
