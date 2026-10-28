import { useMatches } from "react-router-dom";
import { adminRouteHandle } from "./route-handle";
import type { AdminRoutePresentation } from "./route-contract";

export const useAdminRoutePresentation = (): AdminRoutePresentation => {
	const matchList = useMatches();
	for (const match of matchList.slice().reverse()) {
		const handle = Object.values(adminRouteHandle).find(
			(candidate) => candidate === match.handle,
		);
		if (handle) return handle;
	}
	return adminRouteHandle.root;
};
