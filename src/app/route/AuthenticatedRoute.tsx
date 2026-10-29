import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { AuthAdapter } from "@admin/contract/authentication";
import { AuthBoundary } from "@admin/component/authentication";
import { adminRoutePath } from "@admin/route";

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
