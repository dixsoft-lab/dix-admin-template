// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { useObservedElementHeight } from "./useObservedElementHeight";

class Observer implements ResizeObserver {
	static instanceList: Observer[] = [];
	readonly observe = vi.fn();
	readonly unobserve = vi.fn();
	readonly disconnect = vi.fn();
	constructor(private readonly callback: ResizeObserverCallback) {
		Observer.instanceList.push(this);
	}
	notify = () => this.callback([], this);
}

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	Observer.instanceList = [];
});

const Consumer = () => {
	const { elementRef, elementHeight } = useObservedElementHeight();
	return (
		<div ref={elementRef}>
			<output>{elementHeight}</output>
		</div>
	);
};

it("관찰한 element의 크기 변경을 출력에 반영한다", () => {
	// Given: 브라우저 layout이 초기 높이를 제공한다.
	vi.stubGlobal("ResizeObserver", Observer);
	const measurement = vi
		.spyOn(HTMLElement.prototype, "getBoundingClientRect")
		.mockReturnValue(new DOMRect(0, 0, 200, 40));
	render(<Consumer />);
	expect(screen.getByRole("status").textContent).toBe("40");
	const observer = Observer.instanceList[0];
	if (!observer) throw new Error("observer가 생성되지 않았습니다.");
	// When: ResizeObserver가 변경된 높이를 알린다.
	measurement.mockReturnValue(new DOMRect(0, 0, 200, 75));
	act(() => observer.notify());
	// Then: 측정 값이 갱신된다.
	expect(screen.getByRole("status").textContent).toBe("75");
});

it("unmount 때 크기 관찰을 해제한다", () => {
	// Given: element가 관찰 중이다.
	vi.stubGlobal("ResizeObserver", Observer);
	const { unmount } = render(<Consumer />);
	const observer = Observer.instanceList[0];
	if (!observer) throw new Error("observer가 생성되지 않았습니다.");
	// When: 소비 화면이 해제된다.
	unmount();
	// Then: browser observer가 해제된다.
	expect(observer.disconnect).toHaveBeenCalledOnce();
});
