import { createElement } from "react";
import type { PermissionAdapter } from "@/contract/authorization/permission-adapter";
import type {
	Brand,
	NavigationItem,
} from "@/contract/navigation/navigation-contract";
import { routePath } from "@/route/route-paths";
import { DemoBrandLogo } from "./DemoBrandLogo";

export const demoPermission = {
	capabilityList: ["item.read", "item.create"],
	allows: (capability) =>
		capability === "item.read" || capability === "item.create",
} as const satisfies PermissionAdapter;

export const demoBrand = {
	title: "Dix Admin",
	logo: createElement(DemoBrandLogo),
} as const satisfies Brand;

export const demoNavigationList = [
	{ path: routePath.overview, label: "대시보드" },
	{ path: routePath.list, label: "항목", capability: "item.read" },
	{ path: routePath.create, label: "새 항목", capability: "item.create" },
	{ path: routePath.component, label: "공통 컴포넌트" },
] as const satisfies readonly NavigationItem[];
