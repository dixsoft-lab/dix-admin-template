// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { usePendingNavigation } from "./usePendingNavigation";

afterEach(cleanup);

it("pending이 끝난 뒤 마지막 이동 요청을 한 번 실행한다", () => {
	// Given: 처리 중에 이동을 요청했다.
	const navigate = vi.fn();
	const { result, rerender } = renderHook(
		({ pending }) => usePendingNavigation(pending, navigate),
		{ initialProps: { pending: true } },
	);
	act(() => {
		result.current.requestNavigation("/first");
		result.current.requestNavigation("/next");
	});
	expect(navigate).not.toHaveBeenCalled();
	// When: 소비자가 pending을 종료한다.
	rerender({ pending: false });
	// Then: 최종 목적지만 한 번 실행한다.
	expect(navigate).toHaveBeenCalledExactlyOnceWith("/next");
	expect(result.current.hasQueuedNavigation).toBe(false);
});

it("취소한 이동 요청은 pending 종료 후 실행하지 않는다", () => {
	// Given: 대기 중인 이동을 취소했다.
	const navigate = vi.fn();
	const { result, rerender } = renderHook(
		({ pending }) => usePendingNavigation(pending, navigate),
		{ initialProps: { pending: true } },
	);
	act(() => result.current.requestNavigation("/next"));
	act(() => result.current.cancelNavigation());
	// When: pending이 종료된다.
	rerender({ pending: false });
	// Then: 이동하지 않는다.
	expect(navigate).not.toHaveBeenCalled();
});
