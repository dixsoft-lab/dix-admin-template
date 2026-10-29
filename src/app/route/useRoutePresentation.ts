import { useMatches } from "react-router-dom";
import { routeHandle } from "./route-handle";
import type { RoutePresentation } from "./route-contract";

export const useRoutePresentation = (): RoutePresentation => {
	const matchList = useMatches();
	for (const match of matchList.slice().reverse()) {
		const handle = Object.values(routeHandle).find(
			(candidate) => candidate === match.handle,
		);
		if (handle) return handle;
	}
	return routeHandle.root;
};
