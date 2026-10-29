// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
	within,
} from "@testing-library/react";
import { App } from "./App";
import { DemoApp } from "@/app/demo/DemoApp";
import { demoPermission } from "@/app/demo/demo-adapter";
import { canAccessCapability } from "@/contract/authorization/permission-adapter";
import { installDialogStub } from "@/component/overlay/overlay-test-fixture";
import { StrictMode } from "react";

installDialogStub();

beforeEach(() => {
	window.history.replaceState(null, "", "/demo");
});
afterEach(() => {
	cleanup();
	vi.useRealTimers();
	vi.unstubAllEnvs();
	vi.unstubAllGlobals();
});

const openDemo = async () => {
	render(<DemoApp />);
	await screen.findByRole("heading", { name: "대시보드" });
};

const loginAfterLogout = async () => {
	await screen.findByRole("heading", { name: "관리자 로그인" });
	fireEvent.change(screen.getByLabelText("이메일"), {
		target: { value: "demo@example.test" },
	});
	fireEvent.change(screen.getByLabelText("비밀번호"), {
		target: { value: "local-demo-password" },
	});
	fireEvent.click(screen.getByRole("button", { name: "로그인" }));
	await screen.findByRole("heading", { name: "대시보드" });
};

it("기본 진입은 대시보드로 열고 로그아웃할 때만 로그인 화면을 보여준다", async () => {
	// Given: 네트워크가 허용되지 않는 로컬 demo
	const fetchSpy = vi.fn(() => {
		throw new Error("네트워크 호출 금지");
	});
	vi.stubGlobal("fetch", fetchSpy);
	await openDemo();
	expect(screen.getByText("Demo 관리자")).toBeTruthy();
	// When: 로그아웃
	fireEvent.click(screen.getByRole("button", { name: "로그아웃" }));
	// Then: 익명 화면과 무요청
	expect(await screen.findByRole("button", { name: "로그인" })).toBeTruthy();
	await loginAfterLogout();
	expect(screen.getByText("Demo 관리자")).toBeTruthy();
	expect(fetchSpy).not.toHaveBeenCalled();
});

it("로그인 경로를 직접 열어도 기본 데모에서는 대시보드로 이동한다", async () => {
	window.history.replaceState(null, "", "/demo/login");
	render(<DemoApp />);
	expect(await screen.findByRole("heading", { name: "대시보드" })).toBeTruthy();
	expect(screen.queryByRole("heading", { name: "관리자 로그인" })).toBeNull();
});

it("등록된 capability만 허용하고 알 수 없는 capability는 거부한다", () => {
	// Given: 로컬 capability adapter
	// When / Then: 공개 계약을 통해 판정
	expect(canAccessCapability(demoPermission, "item.read")).toBe(true);
	expect(canAccessCapability(demoPermission, "unknown")).toBe(false);
	expect(demoPermission.allows("unknown")).toBe(false);
});

it("목록의 로딩·빈 상태·오류·재시도를 전환한다", async () => {
	// Given: 인증된 목록
	await openDemo();
	vi.useFakeTimers();
	fireEvent.click(screen.getByRole("link", { name: "기본 목록 예시" }));
	expect(screen.getByLabelText("항목 목록 불러오는 중")).toBeTruthy();
	await act(async () => {
		await vi.advanceTimersByTimeAsync(299);
	});
	expect(screen.getByLabelText("항목 목록 불러오는 중")).toBeTruthy();
	await act(async () => {
		await vi.advanceTimersByTimeAsync(1);
	});
	expect(screen.getByRole("table", { name: "예제 항목" })).toBeTruthy();
	// When / Then: 각 예제 상태를 화면에서 선택
	fireEvent.click(screen.getByRole("button", { name: "로딩 보기" }));
	expect(screen.getByLabelText("항목 목록 불러오는 중")).toBeTruthy();
	expect(
		screen.getByText("항목을 불러오는 중입니다.").getAttribute("role"),
	).toBe("status");
	await act(async () => {
		await vi.advanceTimersByTimeAsync(299);
	});
	expect(screen.getByLabelText("항목 목록 불러오는 중")).toBeTruthy();
	await act(async () => {
		await vi.advanceTimersByTimeAsync(1);
	});
	expect(screen.getByRole("table", { name: "예제 항목" })).toBeTruthy();
	fireEvent.click(screen.getByRole("button", { name: "빈 목록 보기" }));
	expect(screen.getByText("표시할 항목이 없습니다.").getAttribute("role")).toBe(
		"status",
	);
	fireEvent.click(screen.getByRole("button", { name: "오류 보기" }));
	expect(screen.getByRole("alert").textContent).toContain("예제 오류");
	fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
	expect(screen.getByRole("table", { name: "예제 항목" })).toBeTruthy();
});

it("신규 등록과 상세 route를 해당 화면으로 연결한다", async () => {
	// Given: 인증된 demo
	await openDemo();
	// When: 신규 등록 화면으로 이동
	fireEvent.click(screen.getByRole("link", { name: "기본 등록 예시" }));
	expect(await screen.findByRole("textbox", { name: /이름/ })).toBeTruthy();
	// And: 목록에서 상세 화면으로 이동
	fireEvent.click(screen.getByRole("link", { name: "기본 목록 예시" }));
	expect(await screen.findByRole("table", { name: "예제 항목" })).toBeTruthy();
	fireEvent.click(screen.getByRole("link", { name: "첫 번째 항목" }));
	expect(await screen.findByText("첫 번째 항목")).toBeTruthy();
});

it("폼 저장의 pending·오류·성공과 목록 반영을 보여준다", async () => {
	// Given: 새 항목 폼
	await openDemo();
	fireEvent.click(screen.getByRole("link", { name: "기본 등록 예시" }));
	await screen.findByLabelText(/이름/);
	vi.useFakeTimers();
	fireEvent.change(screen.getByLabelText(/이름/), {
		target: { value: "새 예제" },
	});
	fireEvent.click(screen.getByLabelText("저장 오류 시뮬레이션"));
	// When: 오류 저장
	fireEvent.click(screen.getByRole("button", { name: "저장" }));
	// Then: 중복 저장 방지와 오류
	expect(
		screen.getByRole("button", { name: "저장" }).hasAttribute("disabled"),
	).toBe(true);
	expect(screen.getByText("저장 중입니다.").getAttribute("role")).toBe(
		"status",
	);
	await act(async () => {
		await vi.advanceTimersByTimeAsync(600);
	});
	expect(screen.getByRole("alert").textContent).toContain("실패");
	// When: 성공 재시도
	fireEvent.click(screen.getByLabelText("저장 오류 시뮬레이션"));
	fireEvent.click(screen.getByRole("button", { name: "저장" }));
	await act(async () => {
		await vi.advanceTimersByTimeAsync(600);
	});
	// Then: 성공 메시지와 생성된 목록
	expect(screen.getByText("항목을 저장했습니다.").getAttribute("role")).toBe(
		"status",
	);
	fireEvent.click(screen.getByRole("link", { name: "기본 목록 예시" }));
	await act(async () => {
		await vi.advanceTimersByTimeAsync(300);
	});
	expect(screen.getByRole("link", { name: "새 예제" })).toBeTruthy();
});

it("공통 컴포넌트 예시 route에서 선택·표·overlay를 조작한다", async () => {
	// Given: 인증된 Demo shell
	await openDemo();
	expect(document.querySelector("aside svg")).toBeTruthy();
	// When: Sidebar에서 공통 UI 예시로 이동
	fireEvent.click(screen.getByRole("link", { name: "공통 컴포넌트" }));
	expect(
		await screen.findByRole("heading", { name: "공통 컴포넌트" }),
	).toBeTruthy();
	expect(screen.getByRole("navigation", { name: "현재 위치" })).toBeTruthy();

	// Then: Combobox는 키보드로 option을 선택한다.
	const combobox = screen.getByRole("combobox", { name: "항목 상태 검색" });
	fireEvent.focus(combobox);
	fireEvent.keyDown(combobox, { key: "ArrowDown" });
	fireEvent.keyDown(combobox, { key: "Enter" });
	expect((combobox as HTMLInputElement).value).toBe("게시 중");

	// And: DataTable은 전체 선택과 빈 상태를 표시한다.
	fireEvent.click(screen.getByRole("checkbox", { name: "모든 행 선택" }));
	expect(screen.getByText("선택한 행: 3개")).toBeTruthy();
	fireEvent.click(screen.getByRole("button", { name: "빈 표 보기" }));
	expect(screen.getByText("이 상태에는 표시할 행이 없습니다.")).toBeTruthy();

	// And: Modal을 열고 닫을 수 있다.
	fireEvent.click(screen.getByRole("button", { name: "Modal 열기" }));
	const dialog = await screen.findByRole("dialog");
	expect(
		within(dialog).getByRole("heading", { name: "Modal 예시" }),
	).toBeTruthy();
	fireEvent.click(within(dialog).getByRole("button", { name: "닫기" }));

	// And: Toast는 polite status로 노출된다.
	fireEvent.click(screen.getByRole("button", { name: "Error Toast" }));
	const errorToast = await screen.findByText("오류 알림입니다.");
	expect(errorToast.closest('[role="status"]')).toBeTruthy();
});

it("production에 consumer가 없으면 demo 대신 설정 오류를 표시한다", () => {
	// Given: production 환경
	vi.stubEnv("DEV", false);
	// When: consumer 없이 시작
	render(<App />);
	// Then: 구성 오류
	expect(screen.getByRole("alert").textContent).toContain("consumer");
	expect(screen.queryByRole("button", { name: "로그인" })).toBeNull();
});

it("production에서는 주입한 consumer를 실행한다", () => {
	// Given: 실제 프로젝트의 composition root
	vi.stubEnv("DEV", false);
	const Consumer = () => <main>소비 앱</main>;
	// When: consumer 주입
	render(<App consumer={Consumer} />);
	// Then: 소비 앱만 표시
	expect(screen.getByRole("main").textContent).toBe("소비 앱");
});

it("development 기본 앱은 StrictMode에서 대시보드로 바로 진입한다", async () => {
	// Given: development와 실제 진입점의 StrictMode
	vi.stubEnv("DEV", true);
	// When: 기본 앱 실행
	render(
		<StrictMode>
			<App />
		</StrictMode>,
	);
	// Then: 앱 준비 문구 없이 lazy demo와 Router가 정상 연결
	expect(screen.queryByText("앱 준비 중")).toBeNull();
	expect(await screen.findByRole("heading", { name: "대시보드" })).toBeTruthy();
	expect(screen.queryByRole("heading", { name: "관리자 로그인" })).toBeNull();
});

it("기본 경로는 대시보드 메뉴 하나를 표시하고 로그아웃하면 로그인 화면을 연다", async () => {
	vi.stubEnv("DEV", true);
	window.history.replaceState(null, "", "/");
	render(<App />);

	const navigation = await screen.findByRole("navigation", {
		name: "관리 메뉴",
	});
	expect(within(navigation).getAllByRole("link")).toHaveLength(1);
	expect(
		within(navigation)
			.getByRole("link", { name: "대시보드" })
			.getAttribute("href"),
	).toBe("/");
	expect(
		screen.getByRole("link", { name: "Dix Admin" }).getAttribute("href"),
	).toBe("/");
	expect(screen.getByText("관리자")).toBeTruthy();

	fireEvent.click(screen.getByRole("button", { name: "로그아웃" }));
	expect(
		await screen.findByRole("heading", { name: "관리자 로그인" }),
	).toBeTruthy();

	fireEvent.change(screen.getByLabelText("이메일"), {
		target: { value: "admin@example.test" },
	});
	fireEvent.change(screen.getByLabelText("비밀번호"), {
		target: { value: "local-password" },
	});
	fireEvent.click(screen.getByRole("button", { name: "로그인" }));
	expect(await screen.findByRole("heading", { name: "대시보드" })).toBeTruthy();
});

it("상세 route는 항목을 표시하고 존재하지 않는 ID는 오류를 표시한다", async () => {
	// Given: 인증된 목록
	await openDemo();
	fireEvent.click(screen.getByRole("link", { name: "기본 목록 예시" }));
	// When: 상세 링크 선택
	fireEvent.click(await screen.findByRole("link", { name: "첫 번째 항목" }));
	// Then: 상세 데이터 표시
	expect(
		await screen.findByRole("heading", { name: "항목 상세" }),
	).toBeTruthy();
	expect(await screen.findByText("첫 번째 항목")).toBeTruthy();
	// When: 없는 ID로 이동
	await act(async () => {
		window.history.pushState(null, "", "/demo/item/missing");
		window.dispatchEvent(new PopStateEvent("popstate"));
	});
	// Then: 오류 표시
	expect(await screen.findByRole("alert")).toHaveProperty(
		"textContent",
		"항목을 찾을 수 없습니다.",
	);
});
