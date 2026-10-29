import {
	createBrowserRouter,
	createRoutesFromElements,
	Navigate,
	Route,
} from "react-router-dom";
import { adminRoutePath, adminRouterBasename } from "@admin/route";
import type {
	AdminRouteElementMap,
	AdminRouterOptions,
} from "./route-contract";
import { adminRouteHandle } from "./route-handle";

export const createAdminRouteList = (element: AdminRouteElementMap) =>
	createRoutesFromElements(
		<>
			<Route
				path={adminRoutePath.root}
				element={<Navigate to={adminRoutePath.overview} replace />}
				handle={adminRouteHandle.root}
			/>
			<Route
				path={adminRoutePath.login}
				element={element.login}
				handle={adminRouteHandle.login}
			/>
			<Route element={element.shell} handle={adminRouteHandle.root}>
				<Route
					path={adminRoutePath.overview}
					element={element.overview}
					handle={adminRouteHandle.overview}
				/>
				<Route
					path={adminRoutePath.list}
					element={element.list}
					handle={adminRouteHandle.list}
				/>
				<Route
					path={adminRoutePath.create}
					element={element.create}
					handle={adminRouteHandle.create}
				/>
				<Route
					path={adminRoutePath.detailPattern}
					element={element.detail}
					handle={adminRouteHandle.detail}
				/>
				<Route
					path={adminRoutePath.notFoundPattern}
					element={element.notFound}
					handle={adminRouteHandle.notFound}
				/>
			</Route>
		</>,
	);

export const createAdminRouter = (
	element: AdminRouteElementMap,
	{ basename = adminRouterBasename }: AdminRouterOptions = {},
) => createBrowserRouter(createAdminRouteList(element), { basename });
