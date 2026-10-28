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
import type { AuthAdapter, AuthState } from "@admin/feature/auth";
import {
	DemoFormPage,
	DemoListPage,
	type DemoRecord,
	type DemoListState,
	type DemoFormState,
} from "@admin/page/demo";
import { Button } from "@admin/shared/design-system";
import { Breadcrumb } from "@admin/shared/ui";
import { OverlayProvider, useOverlay } from "@admin/shared/overlay";
import {
	adminRoutePath,
	AuthenticatedRoute,
	createAdminRouter,
	useAdminRoutePresentation,
} from "../route";
import { AdminShell } from "../layout/AdminShell";
import { CapabilityBoundary } from "../guard/CapabilityBoundary";
import { demoBrand, demoNavigationList, demoPermission } from "./demo-adapter";
import "./demo.css";

type DemoRuntime = {
	readonly auth: AuthAdapter;
	readonly recordList: readonly DemoRecord[];
	readonly listState: DemoListState;
	readonly setListState: (state: DemoListState) => void;
	readonly formState: DemoFormState;
	readonly save: (name: string, simulateError: boolean) => void;
};
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
	const presentation = useAdminRoutePresentation();
	return (
		<AuthenticatedRoute auth={auth}>
			<AdminShell
				auth={auth}
				permission={demoPermission}
				brand={demoBrand}
				navigationList={demoNavigationList}
				activePath={location.pathname}
				routeTitle={presentation.title}
				onNavigate={(path) => {
					void navigate(path);
				}}
			>
				<OverlayProvider>
					<Breadcrumb
						state={presentation.breadcrumb}
						renderLink={({ to, label }) => <Link to={to}>{label}</Link>}
					/>
					<Outlet />
				</OverlayProvider>
			</AdminShell>
		</AuthenticatedRoute>
	);
};

const DemoLogin = () => {
	const { auth } = useDemo();
	if (auth.state.kind === "authenticated")
		return <Navigate to={adminRoutePath.overview} replace />;
	return (
		<main className="dix-admin-theme dix-demo-login">
			<h1>Dix Admin</h1>
			<p>
				Development 전용 UI demo입니다. 실제 인증이나 서버 권한 검사를 수행하지
				않습니다.
			</p>
			<Button onClick={auth.login}>Demo 로그인</Button>
		</main>
	);
};

const DemoOverview = () => {
	const { showToast, openModal } = useOverlay();
	return (
		<section className="dix-demo-page">
			<h1>개요</h1>
			<p>공통 Admin UI의 탐색·목록·폼 동작을 확인하세요.</p>
			<Link to={adminRoutePath.list}>항목 목록 열기</Link>
			<div className="dix-demo-action">
				<Button onClick={() => showToast({ message: "예제 알림입니다." })}>
					알림 보기
				</Button>
				<Button
					onClick={() =>
						openModal({
							title: "예제 모달",
							content: <p>프로젝트의 확인 UI를 이곳에 연결할 수 있습니다.</p>,
						})
					}
				>
					모달 보기
				</Button>
			</div>
		</section>
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
	const { itemId } = useParams();
	const { recordList } = useDemo();
	const record = recordList.find((item) => item.id === itemId);
	return (
		<CapabilityBoundary permission={demoPermission} capability="item.read">
			<section className="dix-demo-page">
				<h1>항목 상세</h1>
				{record ? (
					<p>{record.name}</p>
				) : (
					<p role="alert">항목을 찾을 수 없습니다.</p>
				)}
			</section>
		</CapabilityBoundary>
	);
};

export const DemoApp = () => {
	const [authState, setAuthState] = useState<AuthState>({ kind: "anonymous" });
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
	const [router, setRouter] = useState<ReturnType<
		typeof createAdminRouter
	> | null>(null);
	useEffect(() => {
		const instance = createAdminRouter(
			{
				shell: <DemoShell />,
				login: <DemoLogin />,
				overview: <DemoOverview />,
				list: <DemoList />,
				create: <DemoCreate />,
				detail: <DemoDetail />,
				notFound: <h1>페이지를 찾을 수 없습니다</h1>,
			},
			{ basename: import.meta.env.BASE_URL },
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
		login: () =>
			setAuthState({
				kind: "authenticated",
				account: { displayName: "Demo 관리자", description: "로컬 예제 세션" },
			}),
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
