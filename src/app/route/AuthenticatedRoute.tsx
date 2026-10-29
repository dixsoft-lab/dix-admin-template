import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import type { AuthAdapter } from "@/contract/authentication/auth-adapter";
import { AuthBoundary } from "@/component/authentication/AuthBoundary";
import { routePath } from "@/route/route-paths";

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
			return <Navigate to={routePath.login} replace />;
		case "loading":
		case "error":
		case "authenticated":
			return <AuthBoundary auth={auth}>{() => children}</AuthBoundary>;
		default:
			return auth.state satisfies never;
	}
};
