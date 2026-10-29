import type { ReactNode } from "react";
import { BreadcrumbContext, type BreadcrumbValue } from "./breadcrumb-context";

export const BreadcrumbProvider = ({
	children,
	...value
}: BreadcrumbValue & { readonly children: ReactNode }) => (
	<BreadcrumbContext.Provider value={value}>
		{children}
	</BreadcrumbContext.Provider>
);
