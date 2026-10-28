import { generatePath } from "react-router-dom";

export const adminRouterBasename = "/";

const detailPattern = "/item/:itemId";

export const adminRoutePath = {
	root: "/",
	login: "/login",
	overview: "/overview",
	list: "/item",
	create: "/item/new",
	detailPattern,
	detail: (itemId: string) => generatePath(detailPattern, { itemId }),
	notFoundPattern: "*",
} as const;

export type AdminRoutePath = typeof adminRoutePath;
