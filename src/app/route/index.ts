export { createAdminRouteList, createAdminRouter } from "./router";
export { AuthenticatedRoute } from "./AuthenticatedRoute";
export type { AuthenticatedRouteProps } from "./AuthenticatedRoute";
export { useAdminRoutePresentation } from "./useAdminRoutePresentation";
export { adminRouteHandle } from "./route-handle";
export { adminRoutePath, adminRouterBasename } from "@admin/shared/routing";
export type { AdminRoutePath } from "@admin/shared/routing";
export type {
	AdminRouteElementMap,
	AdminRouterOptions,
	AdminRoutePresentation,
} from "./route-contract";
