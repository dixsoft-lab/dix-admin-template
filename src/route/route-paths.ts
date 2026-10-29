import { generatePath } from "react-router-dom";

export const routerBasename = "/";

const detailPattern = "/item/:itemId";

export const routePath = {
	root: "/",
	login: "/login",
	overview: "/overview",
	list: "/item",
	create: "/item/new",
	component: "/component",
	detailPattern,
	detail: (itemId: string) => generatePath(detailPattern, { itemId }),
	notFoundPattern: "*",
} as const;

export type RoutePath = typeof routePath;
