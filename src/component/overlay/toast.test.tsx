// @vitest-environment jsdom

import { act, cleanup, fireEvent, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { installDialogStub, renderOverlay } from "./overlay-test-fixture";

installDialogStub();
afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

it("toast 교체는 이전 timer와 controller를 무효화한다", () => {
	vi.useFakeTimers();
	const { api } = renderOverlay();
	let first: ReturnType<typeof api.showToast>;
	act(() => {
		first = api.showToast({ message: "첫 알림", durationMs: 100 });
	});
	act(() => {
		api.showToast({ message: "새 알림", durationMs: 200 });
	});
	act(() => {
		first.dismiss();
		vi.advanceTimersByTime(100);
	});
	expect(screen.getByRole("status").textContent).toContain("새 알림");
	act(() => {
		vi.advanceTimersByTime(100);
	});
	expect(screen.queryByText("새 알림")).toBeNull();
	expect(vi.getTimerCount()).toBe(0);
});

it("지속 알림은 controller로 닫으며 status로 알린다", () => {
	vi.useFakeTimers();
	const { api } = renderOverlay();
	let toast: ReturnType<typeof api.showToast>;
	act(() => {
		toast = api.showToast({
			message: "입력을 확인하세요",
			tone: "error",
			durationMs: 0,
		});
	});
	expect(screen.getByRole("status").textContent).toContain("입력을 확인하세요");
	expect(vi.getTimerCount()).toBe(0);
	act(() => toast.dismiss());
	expect(screen.queryByText("입력을 확인하세요")).toBeNull();
});

it("modal이 열리면 유일한 toast host를 dialog top layer 안에 둔다", () => {
	const { api } = renderOverlay();
	act(() => {
		api.showToast({ message: "저장됨", tone: "success", durationMs: 0 });
		api.openModal({ title: "상세", content: "내용" });
	});
	const dialog = screen.getByRole("dialog");
	expect(document.querySelectorAll("[data-toast-host]")).toHaveLength(1);
	expect(dialog.contains(screen.getByRole("status"))).toBe(true);
	fireEvent.click(screen.getByRole("button", { name: "닫기" }));
	expect(document.querySelectorAll("[data-toast-host]")).toHaveLength(1);
	expect(screen.getByRole("status").closest("dialog")).toBeNull();
	expect(screen.getByText("저장됨")).toBeTruthy();
});

it("provider unmount가 예약된 toast timer를 정리한다", () => {
	vi.useFakeTimers();
	const { api, unmount } = renderOverlay();
	act(() => {
		api.showToast({ message: "알림" });
	});
	expect(vi.getTimerCount()).toBe(1);
	unmount();
	expect(vi.getTimerCount()).toBe(0);
});
