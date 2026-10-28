// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { AuthAdapter, AuthState } from "@admin/feature/auth";
import { canAccessCapability } from "@admin/entity/current-account";
import { CapabilityBoundary } from "../guard/CapabilityBoundary";
import { AdminShell, type AdminShellProps } from "./AdminShell";

afterEach(cleanup);

const createAuth = (state: AuthState): AuthAdapter => ({
	state,
	login: vi.fn(),
	logout: vi.fn(),
	retry: vi.fn(),
});

const createShellProps = (auth: AuthAdapter): AdminShellProps => ({
	auth,
	permission: { capabilityList: ["read-entry"], allows: () => true },
	brand: {
		title: "Example Console",
		token: { "--dix-admin-color-primary": "#123456" },
	},
	navigationList: [
		{ path: "/entry", label: "항목", capability: "read-entry", badge: 0 },
		{ path: "/private", label: "비공개", capability: "unknown" },
		{ path: "/invalid", label: "빈 권한", capability: "" },
	],
	activePath: "/entry",
	routeTitle: "항목 목록",
	children: <h1>보호된 화면</h1>,
});

describe("consumer auth와 Admin shell", () => {
	it("로그인 상태를 확인할 때 보호된 화면을 숨기고 진행 상태를 표시한다", () => {
		const prop = createShellProps(createAuth({ kind: "loading" }));
		render(<AdminShell {...prop} />);
		expect(screen.getByRole("status").textContent).toContain("확인");
		expect(screen.queryByRole("main")).toBeNull();
	});

	it("비로그인 상태에서 로그인 버튼을 누르면 주입된 동작을 호출한다", () => {
		const auth = createAuth({ kind: "anonymous" });
		render(<AdminShell {...createShellProps(auth)} />);
		fireEvent.click(screen.getByRole("button", { name: "로그인" }));
		expect(auth.login).toHaveBeenCalledOnce();
		expect(screen.queryByRole("main")).toBeNull();
	});

	it("오류 상태에서 consumer 메시지와 재시도 동작을 연결한다", () => {
		const auth = createAuth({
			kind: "error",
			message: "연결을 확인해 주세요.",
		});
		render(<AdminShell {...createShellProps(auth)} />);
		fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
		expect(auth.retry).toHaveBeenCalledOnce();
		expect(screen.getByRole("alert").textContent).toBe("연결을 확인해 주세요.");
	});

	it("인증된 상태에서 shell과 계정을 표시하고 로그아웃 동작을 호출한다", () => {
		const auth = createAuth({
			kind: "authenticated",
			account: { displayName: "테스트 관리자" },
		});
		render(<AdminShell {...createShellProps(auth)} />);
		fireEvent.click(screen.getByRole("button", { name: "로그아웃" }));
		expect(auth.logout).toHaveBeenCalledOnce();
		expect(screen.getByRole("main").textContent).toBe("보호된 화면");
		expect(screen.getByText("테스트 관리자")).toBeTruthy();
	});

	it("진행 중인 인증 동작은 버튼으로 중복 요청하지 않는다", () => {
		const auth = {
			...createAuth({ kind: "anonymous" }),
			isActionPending: true,
		};
		render(<AdminShell {...createShellProps(auth)} />);
		fireEvent.click(screen.getByRole("button", { name: "로그인" }));
		expect(auth.login).not.toHaveBeenCalled();
		expect(screen.getByRole("button").getAttribute("aria-busy")).toBe("true");
	});

	it("consumer 로그인 동작이 상태를 바꾸면 보호된 화면으로 전환한다", () => {
		const AuthFlow = () => {
			const [state, setState] = useState<AuthState>({ kind: "anonymous" });
			const auth: AuthAdapter = {
				state,
				login: () =>
					setState({
						kind: "authenticated",
						account: { displayName: "관리자" },
					}),
				logout: () => setState({ kind: "anonymous" }),
			};
			return <AdminShell {...createShellProps(auth)} />;
		};
		render(<AuthFlow />);
		fireEvent.click(screen.getByRole("button", { name: "로그인" }));
		expect(screen.getByRole("main").textContent).toBe("보호된 화면");
		expect(screen.queryByRole("button", { name: "로그인" })).toBeNull();
	});

	it("알 수 없는 capability 메뉴를 숨기고 0 badge와 활성 메뉴를 보존한다", () => {
		const prop = createShellProps(
			createAuth({ kind: "authenticated", account: { displayName: "관리자" } }),
		);
		render(<AdminShell {...prop} />);
		expect(screen.queryByRole("link", { name: "비공개" })).toBeNull();
		expect(screen.queryByRole("link", { name: "빈 권한" })).toBeNull();
		expect(
			screen.getByRole("link", { name: "항목 0" }).getAttribute("aria-current"),
		).toBe("page");
	});

	it("메뉴 클릭은 주입된 navigation을 호출한다", () => {
		const onNavigate = vi.fn();
		const prop = createShellProps(
			createAuth({ kind: "authenticated", account: { displayName: "관리자" } }),
		);
		render(<AdminShell {...prop} onNavigate={onNavigate} />);
		fireEvent.click(screen.getByRole("link", { name: "항목 0" }));
		expect(onNavigate).toHaveBeenCalledWith("/entry");
	});

	it("consumer brand와 route metadata로 문서 제목과 theme을 설정한다", () => {
		const prop = createShellProps(
			createAuth({ kind: "authenticated", account: { displayName: "관리자" } }),
		);
		const { container } = render(<AdminShell {...prop} />);
		expect(document.title).toBe("항목 목록 | Example Console");
		expect(
			container.querySelector(".dix-admin-theme")?.getAttribute("style"),
		).toContain("--dix-admin-color-primary: #123456");
	});
});

describe("capability 기본 거부", () => {
	it("등록되지 않은 capability는 consumer가 허용하더라도 판정 함수를 호출하지 않는다", () => {
		const allows = vi.fn(() => true);
		const result = canAccessCapability(
			{ capabilityList: ["read-entry"], allows },
			"unknown",
		);
		expect(result).toBe(false);
		expect(allows).not.toHaveBeenCalled();
	});

	it("등록된 capability도 consumer가 거부하면 보호된 화면을 표시하지 않는다", () => {
		const permission = { capabilityList: ["read-entry"], allows: () => false };
		render(
			<CapabilityBoundary permission={permission} capability="read-entry">
				<h1>보호된 항목</h1>
			</CapabilityBoundary>,
		);
		expect(screen.queryByRole("heading")).toBeNull();
		expect(screen.getByRole("alert").textContent).toContain(
			"접근할 수 없습니다",
		);
	});

	it("등록되고 허용된 capability만 보호된 화면을 표시한다", () => {
		const permission = { capabilityList: ["read-entry"], allows: () => true };
		render(
			<CapabilityBoundary permission={permission} capability="read-entry">
				<h1>보호된 항목</h1>
			</CapabilityBoundary>,
		);
		expect(screen.getByRole("heading").textContent).toBe("보호된 항목");
	});
});
