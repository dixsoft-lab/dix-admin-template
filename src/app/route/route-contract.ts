import type { ReactElement } from "react";
import type { BreadcrumbState } from "@/component/ui/breadcrumb/breadcrumb-context";

export type RouteElementMap = {
	readonly shell: ReactElement;
	readonly login: ReactElement;
	readonly overview: ReactElement;
	readonly list: ReactElement;
	readonly create: ReactElement;
	readonly component: ReactElement;
	readonly detail: ReactElement;
	readonly notFound: ReactElement;
};

export type RouterOptions = {
	readonly basename?: string;
};

export type RoutePresentation = {
	readonly title: string;
	readonly breadcrumb: BreadcrumbState;
};
