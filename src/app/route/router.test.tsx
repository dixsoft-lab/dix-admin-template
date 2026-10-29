// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	screen,
	waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Link, Outlet, RouterProvider, useParams } from "react-router-dom";
import type { AuthAdapter } from "@/contract/authentication/auth-adapter";
import { Breadcrumb } from "@/component/ui/breadcrumb/Breadcrumb";
import { AuthenticatedRoute } from "./AuthenticatedRoute";
import { routePath } from "@/route/route-paths";
import { createRouter } from "./router";
import { useRoutePresentation } from "./useRoutePresentation";
import type { RouteElementMap } from "./route-contract";

const authenticated: AuthAdapter = {
	state: { kind: "authenticated", user: { displayName: "방문자" } },
	login: () => {},
	logout: () => {},
};

const TestShell = ({ auth }: { readonly auth: AuthAdapter }) => {
	const presentation = useRoutePresentation();
	return (
		<AuthenticatedRoute auth={auth}>
			<title>{presentation.title}</title>
			<nav aria-label="메뉴">
				<Link to={routePath.list}>목록으로 이동</Link>
			</nav>
			<Breadcrumb
				state={presentation.breadcrumb}
				renderLink={({ to, label }) => <Link to={to}>{label}</Link>}
			/>
			<Outlet />
		</AuthenticatedRoute>
	);
};

const TestPage = ({ label }: { readonly label: string }) => {
	const presentation = useRoutePresentation();
	const parameter = useParams();
	return (
		<>
			<title>{presentation.title}</title>
			<h1>{label}</h1>
			<output aria-label="식별자">{parameter.itemId}</output>
		</>
	);
};

const createElementMap = (auth = authenticated): RouteElementMap => ({
	shell: <TestShell auth={auth} />,
	login: <TestPage label="로그인 화면" />,
	overview: <TestPage label="개요 화면" />,
	list: <TestPage label="목록 화면" />,
	create: <TestPage label="생성 화면" />,
	component: <TestPage label="컴포넌트 화면" />,
	detail: <TestPage label="상세 화면" />,
	notFound: <TestPage label="없는 화면" />,
});

let router: ReturnType<typeof createRouter> | undefined;

afterEach(() => {
	cleanup();
	router?.dispose();
	router = undefined;
	window.history.replaceState(null, "", "/");
});

describe.each([
	{ name: "기본 root", prefix: "", option: {} },
	{ name: "중첩 admin", prefix: "/admin", option: { basename: "/admin" } },
])("$name 배포 경로", ({ prefix, option }) => {
	it.each([
		{ path: "/login", label: "로그인 화면", title: "로그인" },
		{ path: "/overview", label: "개요 화면", title: "대시보드" },
		{ path: "/item", label: "목록 화면", title: "목록" },
		{ path: "/item/new", label: "생성 화면", title: "새 항목" },
		{ path: "/component", label: "컴포넌트 화면", title: "공통 컴포넌트" },
		{ path: "/item/entry-7", label: "상세 화면", title: "항목 상세" },
		{
			path: "/missing",
			label: "없는 화면",
			title: "페이지를 찾을 수 없습니다",
		},
	])(
		"$path는 명시 등록된 $label을 렌더링한다",
		async ({ path, label, title }) => {
			window.history.replaceState(null, "", `${prefix}${path}`);
			router = createRouter(createElementMap(), option);
			render(<RouterProvider router={router} />);
			expect(await screen.findByRole("heading", { name: label })).toBeTruthy();
			expect(document.title).toBe(title);
			if (path === "/item/entry-7") {
				expect(screen.getByLabelText("식별자").textContent).toBe("entry-7");
			}
		},
	);

	it("root 진입은 같은 basename의 overview로 이동한다", async () => {
		window.history.replaceState(null, "", `${prefix}/`);
		router = createRouter(createElementMap(), option);
		render(<RouterProvider router={router} />);
		expect(
			await screen.findByRole("heading", { name: "개요 화면" }),
		).toBeTruthy();
		expect(window.location.pathname).toBe(`${prefix}/overview`);
	});

	it("breadcrumb와 navigation이 basename을 포함한 같은 목록 경로를 쓴다", async () => {
		window.history.replaceState(null, "", `${prefix}/item/entry-7`);
		router = createRouter(createElementMap(), option);
		render(<RouterProvider router={router} />);
		const breadcrumb = await screen.findByRole("link", { name: "목록" });
		expect(breadcrumb.getAttribute("href")).toBe(`${prefix}/item`);
		expect(
			screen.getByRole("link", { name: "목록으로 이동" }).getAttribute("href"),
		).toBe(`${prefix}/item`);
		fireEvent.click(breadcrumb);
		expect(
			await screen.findByRole("heading", { name: "목록 화면" }),
		).toBeTruthy();
		expect(window.location.pathname).toBe(`${prefix}/item`);
	});

	it("미인증 shell 진입은 같은 basename의 login으로 대체 이동한다", async () => {
		window.history.replaceState(null, "", `${prefix}/item/new`);
		const auth: AuthAdapter = {
			...authenticated,
			state: { kind: "anonymous" },
		};
		router = createRouter(createElementMap(auth), option);
		render(<RouterProvider router={router} />);
		expect(
			await screen.findByRole("heading", { name: "로그인 화면" }),
		).toBeTruthy();
		expect(window.location.pathname).toBe(`${prefix}/login`);
		expect(router.state.historyAction).toBe("REPLACE");
		expect(screen.queryByRole("heading", { name: "생성 화면" })).toBeNull();
	});
});

describe("인증 상태를 기다리는 route", () => {
	it.each([
		{
			state: { kind: "loading" } as const,
			role: "status",
			text: "로그인 상태를 확인하고 있습니다.",
		},
		{
			state: { kind: "error", message: "연결 실패" } as const,
			role: "alert",
			text: "연결 실패",
		},
	])(
		"$state.kind 상태는 페이지를 열거나 login으로 이동하지 않는다",
		async ({ state, role, text }) => {
			window.history.replaceState(null, "", "/item/new");
			router = createRouter(createElementMap({ ...authenticated, state }));
			render(<RouterProvider router={router} />);
			await waitFor(() =>
				expect(screen.getByRole(role).textContent).toBe(text),
			);
			expect(screen.queryByRole("heading", { name: "생성 화면" })).toBeNull();
			expect(window.location.pathname).toBe("/item/new");
		},
	);
});
