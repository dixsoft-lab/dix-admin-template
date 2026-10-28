// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, screen } from "@testing-library/react";
import { installDialogStub, renderOverlay } from "./overlay-test-fixture";

installDialogStub();
afterEach(() => {
	cleanup();
	vi.useRealTimers();
	document.body.style.overflow = "";
});

it("열기와 native Escape cancel 이후 focus와 기존 scroll 설정을 복구한다", () => {
	const { api } = renderOverlay(<button>열기</button>);
	const opener = screen.getByRole("button", { name: "열기" });
	opener.focus();
	document.body.style.overflow = "clip";
	act(() => {
		api.openModal({
			title: "확인",
			description: "작업 안내",
			content: <input aria-label="값" />,
		});
	});
	const dialog = screen.getByRole("dialog", { name: "확인" });
	expect(dialog.getAttribute("aria-describedby")).toBeTruthy();
	expect(document.activeElement).toBe(dialog);
	expect(document.body.style.overflow).toBe("hidden");
	const event = new Event("cancel", { bubbles: true, cancelable: true });
	fireEvent(dialog, event);
	expect(event.defaultPrevented).toBe(true);
	expect(screen.queryByRole("dialog")).toBeNull();
	expect(document.activeElement).toBe(opener);
	expect(document.body.style.overflow).toBe("clip");
});

it("pending은 Escape·명령·교체를 막고 update로 해제한 뒤 닫힌다", () => {
	const { api } = renderOverlay();
	let modal: ReturnType<typeof api.openModal>;
	act(() => {
		modal = api.openModal({
			title: "처리 중",
			content: "기다리세요",
			isPending: true,
		});
	});
	const dialog = screen.getByRole("dialog");
	expect(
		screen.getByRole("button", { name: "닫기" }).hasAttribute("disabled"),
	).toBe(true);
	fireEvent(dialog, new Event("cancel", { bubbles: true, cancelable: true }));
	dialog.removeAttribute("open");
	fireEvent(dialog, new Event("close", { bubbles: true }));
	expect(dialog.hasAttribute("open")).toBe(true);
	fireEvent.keyDown(dialog, { key: "Tab" });
	expect(document.activeElement).toBe(dialog);
	act(() => {
		modal.close();
		api.openModal({ title: "교체", content: "다른 내용" });
	});
	expect(screen.getByRole("dialog", { name: "처리 중" })).toBe(dialog);
	act(() => {
		modal.update({ isPending: false, content: "완료" });
	});
	expect(screen.getByText("완료")).toBeTruthy();
	fireEvent.click(screen.getByRole("button", { name: "닫기" }));
	expect(screen.queryByRole("dialog")).toBeNull();
});

it("Tab과 Shift+Tab을 활성 dialog의 focusable element 안에서 순환한다", () => {
	const { api } = renderOverlay();
	act(() => {
		api.openModal({
			title: "입력",
			content: (
				<>
					<input aria-label="첫 입력" />
					<button disabled>비활성</button>
					<button hidden>숨김</button>
					<button>마지막</button>
					<fieldset disabled>
						<button>fieldset 비활성</button>
					</fieldset>
					<div style={{ display: "none" }}>
						<button>상위 숨김</button>
					</div>
					<button tabIndex={-2}>제외된 tabindex</button>
				</>
			),
		});
	});
	const dialog = screen.getByRole("dialog");
	const close = screen.getByRole("button", { name: "닫기" });
	const last = screen.getByRole("button", { name: "마지막" });
	last.focus();
	fireEvent.keyDown(last, { key: "Tab" });
	expect(document.activeElement).toBe(close);
	fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
	expect(document.activeElement).toBe(last);
	dialog.focus();
	fireEvent.keyDown(dialog, { key: "Tab" });
	expect(document.activeElement).toBe(close);
});

it("교체 전 controller와 비동기 native close event는 새 modal을 닫지 못한다", () => {
	vi.useFakeTimers();
	const { api } = renderOverlay(<button>원래 버튼</button>);
	const opener = screen.getByRole("button", { name: "원래 버튼" });
	opener.focus();
	let first: ReturnType<typeof api.openModal>;
	let second: ReturnType<typeof api.openModal>;
	act(() => {
		first = api.openModal({ title: "첫째", content: "첫 내용" });
	});
	const nativeClose = vi.fn();
	screen.getByRole("dialog").addEventListener("close", nativeClose);
	act(() => {
		second = api.openModal({ title: "둘째", content: "둘 내용" });
	});
	act(() => {
		first.close();
		first.update({ title: "오래된 변경" });
		vi.runAllTimers();
	});
	expect(nativeClose).toHaveBeenCalled();
	expect(screen.getAllByRole("dialog")).toHaveLength(1);
	expect(screen.getByRole("dialog", { name: "둘째" })).toBeTruthy();
	expect(document.body.style.overflow).toBe("hidden");
	act(() => {
		second.close();
		vi.runAllTimers();
	});
	expect(document.activeElement).toBe(opener);
});

it("unmount 시 dialog와 body scroll lock을 정리한다", () => {
	const { api, unmount } = renderOverlay();
	document.body.style.overflow = "auto";
	act(() => {
		api.openModal({ title: "열림", content: "내용" });
	});
	unmount();
	expect(document.body.style.overflow).toBe("auto");
	expect(document.querySelector("dialog")).toBeNull();
});

it("dialog 내부 클릭은 유지하고 backdrop 좌표 클릭은 닫는다", () => {
	const { api } = renderOverlay();
	act(() => {
		api.openModal({ title: "클릭", content: "내용" });
	});
	const dialog = screen.getByRole("dialog");
	vi.spyOn(dialog, "getBoundingClientRect").mockReturnValue(
		new DOMRect(10, 10, 100, 100),
	);
	fireEvent.click(dialog, { clientX: 50, clientY: 50 });
	expect(screen.getByRole("dialog")).toBe(dialog);
	fireEvent.click(dialog, { clientX: 0, clientY: 0 });
	expect(screen.queryByRole("dialog")).toBeNull();
});
