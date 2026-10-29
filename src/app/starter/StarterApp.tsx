import { createContext, useContext, useState } from "react";
import {
	BrowserRouter,
	Link,
	Navigate,
	Outlet,
	Route,
	Routes,
	useLocation,
	useNavigate,
} from "react-router-dom";

import { DixAdminLogo } from "@/app/DixAdminLogo";
import { AuthenticatedRoute } from "@/app/route/AuthenticatedRoute";
import { routeHandle } from "@/app/route/route-handle";
import { Breadcrumb } from "@/component/ui/breadcrumb/Breadcrumb";
import type {
	AuthAdapter,
	AuthState,
} from "@/contract/authentication/auth-adapter";
import type { PermissionAdapter } from "@/contract/authorization/permission-adapter";
import type {
	Brand,
	NavigationItem,
} from "@/contract/navigation/navigation-contract";
import { useDocumentTitle } from "@/hook/useDocumentTitle";
import { Shell } from "@/layout/Shell";
import { LoginPage } from "@/page/login/LoginPage";
import { HomePage } from "@/page/home/HomePage";
import { routePath } from "@/route/route-paths";

const starterUser = {
	displayName: "관리자",
	description: "템플릿 미리보기",
} as const;
const starterBrand = {
	title: "Dix Admin",
	logo: <DixAdminLogo />,
} satisfies Brand;
const starterNavigationList = [
	{ path: routePath.root, label: "대시보드" },
] as const satisfies readonly NavigationItem[];
const starterPermission = {
	capabilityList: [],
	allows: () => false,
} satisfies PermissionAdapter;

type StarterRuntime = {
	readonly auth: AuthAdapter;
};

const StarterContext = createContext<StarterRuntime | null>(null);

const useStarter = () => {
	const runtime = useContext(StarterContext);
	if (!runtime) throw new Error("StarterRuntime이 필요합니다.");
	return runtime;
};

const StarterShell = () => {
	const { auth } = useStarter();
	const location = useLocation();
	const navigate = useNavigate();

	return (
		<AuthenticatedRoute auth={auth}>
			<Shell
				auth={auth}
				permission={starterPermission}
				brand={starterBrand}
				navigationList={starterNavigationList}
				activePath={location.pathname + location.search}
				homePath={routePath.root}
				routeTitle="대시보드"
				onNavigate={(path) => void navigate(path)}
			>
				<Breadcrumb
					state={routeHandle.overview.breadcrumb}
					renderLink={({ to, label }) => <Link to={to}>{label}</Link>}
				/>
				<Outlet />
			</Shell>
		</AuthenticatedRoute>
	);
};

const StarterLogin = () => {
	const { auth } = useStarter();
	useDocumentTitle(`관리자 로그인 | ${starterBrand.title}`);
	if (auth.state.kind === "authenticated")
		return <Navigate to={routePath.root} replace />;

	return (
		<LoginPage
			onLogin={auth.login}
			brandLogo={<DixAdminLogo className="mx-auto mb-4 block size-11" />}
		/>
	);
};

export const StarterApp = () => {
	const [authState, setAuthState] = useState<AuthState>({
		kind: "authenticated",
		user: starterUser,
	});
	const auth: AuthAdapter = {
		state: authState,
		login: () => setAuthState({ kind: "authenticated", user: starterUser }),
		logout: () => setAuthState({ kind: "anonymous" }),
	};

	return (
		<StarterContext value={{ auth }}>
			<BrowserRouter basename={import.meta.env.BASE_URL}>
				<Routes>
					<Route path={routePath.login} element={<StarterLogin />} />
					<Route path={routePath.root} element={<StarterShell />}>
						<Route index element={<HomePage />} />
					</Route>
					<Route
						path={routePath.notFoundPattern}
						element={<Navigate to={routePath.root} replace />}
					/>
				</Routes>
			</BrowserRouter>
		</StarterContext>
	);
};
