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
				{element.payment && (
					<Route
						path={routePath.paymentPattern}
						element={element.payment}
						handle={routeHandle.payment}
					/>
				)}
				{element.editorExample && (
					<Route
						path={routePath.editorExamplePattern}
						element={element.editorExample}
						handle={routeHandle.editorExample}
					/>
				)}
				{element.analytics && (
					<Route
						path={routePath.analyticsPattern}
						element={element.analytics}
						handle={routeHandle.analytics}
					/>
				)}
				{element.detailAnalytics && (
					<Route
						path={routePath.detailAnalyticsPattern}
						element={element.detailAnalytics}
						handle={routeHandle.detailAnalytics}
					/>
				)}
				{element.contentList && (
					<Route
						path={routePath.contentList}
						element={element.contentList}
						handle={routeHandle.contentList}
					/>
				)}
				{element.contentCreate && (
					<Route
						path={routePath.contentCreate}
						element={element.contentCreate}
						handle={routeHandle.contentCreate}
					/>
				)}
				{element.contentEditor && (
					<Route
						path={routePath.contentPattern}
						element={element.contentEditor}
						handle={routeHandle.contentEdit}
					/>
				)}
				{element.commentQueue && (
					<>
						<Route
							path={routePath.commentQueue}
							element={element.commentQueue}
							handle={routeHandle.commentQueue}
						/>
						<Route
							path={routePath.commentQueuePattern}
							element={element.commentQueue}
							handle={routeHandle.commentQueue}
						/>
					</>
				)}
				{element.accountList && (
					<Route
						path={routePath.accountList}
						element={element.accountList}
						handle={routeHandle.accountList}
					/>
				)}
				{element.accountCreate && (
					<Route
						path={routePath.accountCreate}
						element={element.accountCreate}
						handle={routeHandle.accountCreate}
					/>
				)}
				{element.accountAccessDenied && (
					<Route
						path={routePath.accountAccessDenied}
						element={element.accountAccessDenied}
						handle={routeHandle.accountAccessDenied}
					/>
				)}
				{element.approval && (
					<Route
						path={routePath.approvalPattern}
						element={element.approval}
						handle={routeHandle.approval}
					/>
				)}
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
