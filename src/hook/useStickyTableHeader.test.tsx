// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useStickyTableHeader } from "./useStickyTableHeader";

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});
const Consumer = () => {
	const { panelRef, isHeaderStuck } = useStickyTableHeader(50);
	return (
		<div ref={panelRef}>
			<table>
				<thead>
					<tr>
						<th>이름</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td>Alpha</td>
					</tr>
				</tbody>
			</table>
			<output>{String(isHeaderStuck)}</output>
		</div>
	);
};

it("table이 sticky 범위에 있을 때 상태를 제공한다", () => {
	// Given: 브라우저 layout이 header 아래에 table을 배치했다.
	vi.stubGlobal(
		"ResizeObserver",
		class {
			observe = vi.fn();
			disconnect = vi.fn();
		},
	);
	vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue(
		new DOMRect(0, 10, 200, 300),
	);
	vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(200);
	vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(30);
	// When: Hook을 사용하는 table을 mount한다.
	render(<Consumer />);
	// Then: header가 붙은 상태를 알린다.
	expect(screen.getByRole("status").textContent).toBe("true");
});

it("unmount 때 예약 frame과 scroll 구독을 정리한다", () => {
	// Given: scroll로 다음 layout 측정이 예약됐다.
	const disconnect = vi.fn();
	const schedule = vi.fn(() => 42);
	const cancel = vi.fn();
	vi.stubGlobal(
		"ResizeObserver",
		class {
			observe = vi.fn();
			disconnect = disconnect;
		},
	);
	vi.stubGlobal("requestAnimationFrame", schedule);
	vi.stubGlobal("cancelAnimationFrame", cancel);
	const { unmount } = render(<Consumer />);
	fireEvent.scroll(window);
	// When: 소비 화면이 해제된다.
	unmount();
	// Then: frame과 observer를 해제하고 이후 scroll은 예약하지 않는다.
	expect(cancel).toHaveBeenCalledExactlyOnceWith(42);
	expect(disconnect).toHaveBeenCalledOnce();
	schedule.mockClear();
	fireEvent.scroll(window);
	expect(schedule).not.toHaveBeenCalled();
});
