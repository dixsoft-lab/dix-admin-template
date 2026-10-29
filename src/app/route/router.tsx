import {
	createBrowserRouter,
	createRoutesFromElements,
	Navigate,
	Route,
} from "react-router-dom";
import { routePath, routerBasename } from "@/route/route-paths";
import type { RouteElementMap, RouterOptions } from "./route-contract";
import { routeHandle } from "./route-handle";

export const createRouteList = (element: RouteElementMap) =>
	createRoutesFromElements(
		<>
			<Route
				path={routePath.root}
				element={<Navigate to={routePath.overview} replace />}
				handle={routeHandle.root}
			/>
			<Route
				path={routePath.login}
				element={element.login}
				handle={routeHandle.login}
			/>
			<Route element={element.shell} handle={routeHandle.root}>
				<Route
					path={routePath.overview}
					element={element.overview}
					handle={routeHandle.overview}
				/>
				<Route
					path={routePath.list}
					element={element.list}
					handle={routeHandle.list}
				/>
				<Route
					path={routePath.create}
					element={element.create}
					handle={routeHandle.create}
				/>
				<Route
					path={routePath.component}
					element={element.component}
					handle={routeHandle.component}
				/>
				<Route
					path={routePath.detailPattern}
					element={element.detail}
					handle={routeHandle.detail}
				/>
				<Route
					path={routePath.notFoundPattern}
					element={element.notFound}
					handle={routeHandle.notFound}
				/>
			</Route>
		</>,
	);

export const createRouter = (
	element: RouteElementMap,
	{ basename = routerBasename }: RouterOptions = {},
) => createBrowserRouter(createRouteList(element), { basename });
