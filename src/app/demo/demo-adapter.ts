import type { PermissionAdapter } from "@admin/contract/authorization";
import type { AdminBrand, NavigationItem } from "@admin/contract/navigation";
import { adminRoutePath } from "@admin/route";

export const demoPermission = {
	capabilityList: ["item.read", "item.create"],
	allows: (capability) =>
		capability === "item.read" || capability === "item.create",
} as const satisfies PermissionAdapter;

export const demoBrand = {
	title: "Dix Admin",
} as const satisfies AdminBrand;

export const demoNavigationList = [
	{ path: adminRoutePath.overview, label: "대시보드" },
	{ path: adminRoutePath.list, label: "항목", capability: "item.read" },
	{ path: adminRoutePath.create, label: "새 항목", capability: "item.create" },
] as const satisfies readonly NavigationItem[];
