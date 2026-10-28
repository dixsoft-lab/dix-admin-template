import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { AuthAdapter } from "@admin/feature/auth";
import { adminRoutePath } from "@admin/shared/routing";
import { AuthBoundary } from "../guard/AuthBoundary";

export type AuthenticatedRouteProps = {
	readonly auth: AuthAdapter;
	readonly children: ReactNode;
};

export const AuthenticatedRoute = ({
	auth,
	children,
}: AuthenticatedRouteProps) => {
	switch (auth.state.kind) {
		case "anonymous":
			return <Navigate to={adminRoutePath.login} replace />;
		case "loading":
		case "error":
		case "authenticated":
			return <AuthBoundary auth={auth}>{() => children}</AuthBoundary>;
		default:
			return auth.state satisfies never;
	}
};
