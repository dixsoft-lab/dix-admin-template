// @vitest-environment jsdom
import {
	cleanup,
	fireEvent,
	render,
	renderHook,
	screen,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";

import { useSectionNavigation } from "./useSectionNavigation";

afterEach(() => {
	cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
});
const sectionIdList = ["example-section"] as const;

it("페이지 끝에서는 짧은 마지막 section을 현재 위치로 표시한다", () => {
	// Given: 마지막 section이 상단 offset까지 올라올 수 없는 짧은 페이지다.
	vi.stubGlobal(
		"ResizeObserver",
		class {
			observe = vi.fn();
			disconnect = vi.fn();
		},
	);
	vi.stubGlobal("scrollY", 500);
	vi.stubGlobal("innerHeight", 400);
	vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(
		900,
	);
	render(
		<>
			<section id="first" data-testid="first">
				첫 번째
			</section>
			<section id="last" data-testid="last">
				마지막
			</section>
		</>,
	);
	vi.spyOn(
		screen.getByTestId("first"),
		"getBoundingClientRect",
	).mockReturnValue(new DOMRect(0, -200, 200, 100));
	vi.spyOn(screen.getByTestId("last"), "getBoundingClientRect").mockReturnValue(
		new DOMRect(0, 200, 200, 100),
	);
	// When: section navigation이 현재 위치를 측정한다.
	const { result } = renderHook(() =>
		useSectionNavigation({ sectionIdList: ["first", "last"] }),
	);
	// Then: 마지막 section을 활성화한다.
	expect(result.current.activeSectionId).toBe("last");
});

it("consumer offset과 reduced motion 설정을 적용해 section으로 이동한다", () => {
	// Given: consumer가 section ID와 상단 offset을 제공한다.
	const scrollTo = vi.fn();
	vi.stubGlobal("scrollTo", scrollTo);
	vi.stubGlobal(
		"matchMedia",
		vi.fn(() => ({ matches: true })),
	);
	vi.stubGlobal(
		"ResizeObserver",
		class {
			observe = vi.fn();
			disconnect = vi.fn();
		},
	);
	const Consumer = () => {
		const { navigateToSection } = useSectionNavigation({
			sectionIdList,
			offset: 80,
		});
		return (
			<>
				<button onClick={() => navigateToSection("example-section")}>
					내용으로 이동
				</button>
				<section id="example-section" data-testid="section">
					내용
				</section>
			</>
		);
	};
	render(<Consumer />);
	vi.spyOn(
		screen.getByTestId("section"),
		"getBoundingClientRect",
	).mockReturnValue(new DOMRect(0, 300, 200, 100));
	// When: section 이동을 요청한다.
	fireEvent.click(screen.getByRole("button", { name: "내용으로 이동" }));
	// Then: consumer offset을 제외하고 animation 없이 이동한다.
	expect(scrollTo).toHaveBeenCalledExactlyOnceWith({
		top: 220,
		behavior: "instant",
	});
});
