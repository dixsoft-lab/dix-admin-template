import type { ReactElement } from "react";
import type { BreadcrumbState } from "@admin/component/ui";

export type AdminRouteElementMap = {
	readonly shell: ReactElement;
	readonly login: ReactElement;
	readonly overview: ReactElement;
	readonly list: ReactElement;
	readonly create: ReactElement;
	readonly detail: ReactElement;
	readonly notFound: ReactElement;
};

export type AdminRouterOptions = {
	readonly basename?: string;
};

export type AdminRoutePresentation = {
	readonly title: string;
	readonly breadcrumb: BreadcrumbState;
};
