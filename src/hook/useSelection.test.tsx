// @vitest-environment jsdom
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { useSelection } from "./useSelection";

afterEach(cleanup);

it("현재 목록을 모두 해제해도 목록 밖의 선택은 보존한다", () => {
	// Given: 모든 표시 항목과 다른 페이지의 항목이 선택됐다.
	const onChange = vi.fn();
	const { result } = renderHook(() =>
		useSelection({
			keyList: ["a", "b"],
			selectedKeyList: ["a", "b", "other"],
			onChange,
		}),
	);
	// When: 전체 선택을 해제한다.
	act(() => result.current.toggleAll());
	// Then: 다른 페이지의 선택을 남긴다.
	expect(onChange).toHaveBeenCalledExactlyOnceWith(["other"]);
});

it("빈 목록에서 전체 선택을 눌러도 변경을 만들지 않는다", () => {
	// Given: 표시할 항목이 없다.
	const onChange = vi.fn();
	const { result } = renderHook(() =>
		useSelection({ keyList: [], selectedKeyList: [], onChange }),
	);
	// When: 전체 선택을 요청한다.
	act(() => result.current.toggleAll());
	// Then: 선택된 상태나 변경 callback을 만들지 않는다.
	expect(result.current.isAllSelected).toBe(false);
	expect(onChange).not.toHaveBeenCalled();
});
