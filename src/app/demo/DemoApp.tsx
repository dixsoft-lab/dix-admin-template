import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
	Link,
	Navigate,
	Outlet,
	RouterProvider,
	useLocation,
	useNavigate,
	useParams,
} from "react-router-dom";
import type {
	AuthAdapter,
	AuthState,
} from "@/contract/authentication/auth-adapter";
import {
	type DemoFormState,
	type DemoListState,
	type DemoRecord,
} from "@/page/demo/item/demo-record";
import { DemoFormPage } from "@/page/demo/item/new/DemoFormPage";
import { DemoListPage } from "@/page/demo/item/DemoListPage";
import { DemoDashboardPage } from "@/page/demo/overview/DemoDashboardPage";
import { DemoComponentPage } from "@/page/demo/component/DemoComponentPage";
import { DemoPaymentPage } from "@/page/demo/payment/DemoPaymentPage";
import { DemoEditorPage } from "@/page/demo/editor/DemoEditorPage";
import { DemoStoryCreatePage } from "@/page/demo/story/new/DemoStoryCreatePage";
import { DemoStoryEditPage } from "@/page/demo/story/detail/DemoStoryEditPage";
import { DemoDetailPage } from "@/page/demo/item/detail/DemoDetailPage";
import { DemoLoginPage } from "@/page/demo/login/DemoLoginPage";
import { DemoReportPage } from "@/page/demo/report/DemoReportPage";
import { DemoStoryReportPage } from "@/page/demo/report/story/DemoStoryReportPage";
import { DemoStoryListPage } from "@/page/demo/story/DemoStoryListPage";
import { DemoModerationPage } from "@/page/demo/moderation/DemoModerationPage";
import { DemoAccountListPage } from "@/page/demo/account/DemoAccountListPage";
import { DemoAccountCreatePage } from "@/page/demo/account/new/DemoAccountCreatePage";
import { DemoAccountAccessDeniedPage } from "@/page/demo/account/access-denied/DemoAccountAccessDeniedPage";
import { DemoReviewPage } from "@/page/demo/review/DemoReviewPage";
import { DemoNotFoundPage } from "@/page/demo/not-found/DemoNotFoundPage";
import { Breadcrumb } from "@/component/ui/breadcrumb/Breadcrumb";
import { OverlayProvider } from "@/component/overlay/OverlayProvider";
import { Shell } from "@/layout/Shell";
import { CapabilityBoundary } from "@/component/authorization/CapabilityBoundary";
import { routePath } from "@/route/route-paths";
import { AuthenticatedRoute } from "@/app/route/AuthenticatedRoute";
import { createRouter } from "@/app/route/router";
import { useRoutePresentation } from "@/app/route/useRoutePresentation";
import { useDocumentTitle } from "@/hook/useDocumentTitle";
import { demoBrand, demoNavigationList, demoPermission } from "./demo-adapter";
import { DemoBrandLogo } from "./DemoBrandLogo";

type DemoRuntime = {
	readonly auth: AuthAdapter;
	readonly recordList: readonly DemoRecord[];
	readonly listState: DemoListState;
	readonly setListState: (state: DemoListState) => void;
	readonly formState: DemoFormState;
	readonly save: (name: string, simulateError: boolean) => void;
};
const demoUser = {
	displayName: "Demo 관리자",
	description: "로컬 예제 세션",
} as const;
const DemoContext = createContext<DemoRuntime | null>(null);
const useDemo = () => {
	const runtime = useContext(DemoContext);
	if (!runtime) throw new Error("DemoRuntime이 필요합니다.");
	return runtime;
};

const DemoShell = () => {
	const { auth } = useDemo();
	const navigate = useNavigate();
	const location = useLocation();
	const presentation = useRoutePresentation();
	return (
		<AuthenticatedRoute auth={auth}>
			<Shell
				auth={auth}
				permission={demoPermission}
				brand={demoBrand}
				navigationList={demoNavigationList}
				activePath={location.pathname + location.search}
				homePath={routePath.root}
				routeTitle={presentation.title}
				onNavigate={(path) => {
					void navigate(path);
				}}
			>
				<OverlayProvider>
					{!location.pathname.startsWith("/editor/") &&
						!location.pathname.startsWith(`${routePath.contentList}/`) && (
							<Breadcrumb
								state={presentation.breadcrumb}
								renderLink={({ to, label }) => <Link to={to}>{label}</Link>}
							/>
						)}
					<Outlet />
				</OverlayProvider>
			</Shell>
		</AuthenticatedRoute>
	);
};

const DemoLogin = () => {
	const { auth } = useDemo();
	useDocumentTitle(`관리자 로그인 | ${demoBrand.title}`);
	if (auth.state.kind === "authenticated")
		return <Navigate to={routePath.overview} replace />;
	return (
		<DemoLoginPage
			onLogin={auth.login}
			brandLogo={<DemoBrandLogo className="mx-auto mb-4 block size-11" />}
		/>
	);
};

const DemoList = () => {
	const runtime = useDemo();
	return (
		<CapabilityBoundary permission={demoPermission} capability="item.read">
			<DemoListPage
				state={runtime.listState}
				recordList={runtime.recordList}
				onStateChange={runtime.setListState}
			/>
		</CapabilityBoundary>
	);
};
const DemoCreate = () => {
	const runtime = useDemo();
	return (
		<CapabilityBoundary permission={demoPermission} capability="item.create">
			<DemoFormPage state={runtime.formState} onSubmit={runtime.save} />
		</CapabilityBoundary>
	);
};
const DemoDetail = () => {
	const { itemId = "" } = useParams();
	const { recordList } = useDemo();
	const record = recordList.find((item) => item.id === itemId);
	return (
		<CapabilityBoundary permission={demoPermission} capability="item.read">
			<DemoDetailPage itemId={itemId} record={record} />
		</CapabilityBoundary>
	);
};

export const DemoApp = () => {
	const [authState, setAuthState] = useState<AuthState>({
		kind: "authenticated",
		user: demoUser,
	});
	const [recordList, setRecordList] = useState<readonly DemoRecord[]>([
		{ id: "sample-1", name: "첫 번째 항목" },
		{ id: "sample-2", name: "두 번째 항목" },
	]);
	const [listState, setListState] = useState<DemoListState>("success");
	const [formState, setFormState] = useState<DemoFormState>("idle");
	const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
	useEffect(
		() => () => {
			if (timer.current !== null) clearTimeout(timer.current);
		},
		[],
	);
	const [router, setRouter] = useState<ReturnType<typeof createRouter> | null>(
		null,
	);
	const storyCreatePage = <DemoStoryCreatePage />;
	const storyEditPage = <DemoStoryEditPage />;
	useEffect(() => {
		const instance = createRouter(
			{
				shell: <DemoShell />,
				login: <DemoLogin />,
				overview: <DemoDashboardPage />,
				list: <DemoList />,
				create: <DemoCreate />,
				payment: <DemoPaymentPage />,
				editorExample: <DemoEditorPage />,
				component: <DemoComponentPage />,
				detail: <DemoDetail />,
				analytics: <DemoReportPage />,
				detailAnalytics: <DemoStoryReportPage />,
				contentList: <DemoStoryListPage />,
				contentCreate: storyCreatePage,
				contentEditor: storyEditPage,
				commentQueue: <DemoModerationPage />,
				accountList: <DemoAccountListPage />,
				accountCreate: <DemoAccountCreatePage />,
				accountAccessDenied: <DemoAccountAccessDeniedPage />,
				approval: <DemoReviewPage />,
				notFound: <DemoNotFoundPage />,
			},
			{
				basename: `${import.meta.env.BASE_URL.replace(/\/+$/, "")}/demo`,
			},
		);
		setRouter(instance);
		return () => instance.dispose();
	}, []);
	const resetPending = () => {
		if (timer.current !== null) clearTimeout(timer.current);
		timer.current = null;
		setFormState("idle");
	};
	const auth: AuthAdapter = {
		state: authState,
		login: () => setAuthState({ kind: "authenticated", user: demoUser }),
		logout: () => {
			resetPending();
			setAuthState({ kind: "anonymous" });
		},
	};
	const save = (name: string, simulateError: boolean) => {
		if (timer.current !== null) return;
		setFormState("pending");
		timer.current = setTimeout(() => {
			timer.current = null;
			if (simulateError) {
				setFormState("error");
				return;
			}
			setRecordList((current) => [
				...current,
				{ id: crypto.randomUUID(), name },
			]);
			setListState("success");
			setFormState("success");
		}, 600);
	};
	return (
		<DemoContext
			value={{ auth, recordList, listState, setListState, formState, save }}
		>
			{router && <RouterProvider router={router} />}
		</DemoContext>
	);
};
