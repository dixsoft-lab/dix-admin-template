import type { PermissionAdapter } from "@admin/entity/current-account";
import type { AdminBrand, NavigationItem } from "@admin/widget/sidebar";
import { adminRoutePath } from "@admin/shared/routing";

export const demoPermission = {
	capabilityList: ["item.read", "item.create"],
	allows: (capability) =>
		capability === "item.read" || capability === "item.create",
} as const satisfies PermissionAdapter;

export const demoBrand = {
	title: "Dix Admin",
	token: { "--dix-admin-color-primary": "#4f46e5" },
} as const satisfies AdminBrand;

export const demoNavigationList = [
	{ path: adminRoutePath.overview, label: "개요" },
	{ path: adminRoutePath.list, label: "항목", capability: "item.read" },
	{ path: adminRoutePath.create, label: "새 항목", capability: "item.create" },
] as const satisfies readonly NavigationItem[];
