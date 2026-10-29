// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, useLocation, useNavigate } from "react-router-dom";
import { Navigation } from "./Navigation";

afterEach(() => {
	cleanup();
	vi.clearAllTimers();
	vi.useRealTimers();
});

it.each(["/", "/admin"])(
	"basename %s에서 일반 클릭과 modified click의 경로를 구분한다",
	(basename) => {
		// Given: app-local navigation과 실제 Router
		vi.useFakeTimers();
		const onNavigate = vi.fn();
		const Fixture = () => {
			const navigate = useNavigate();
			const location = useLocation();
			return (
				<>
					<Navigation
						itemList={[{ path: "/item", label: "항목" }]}
						permission={{ capabilityList: [], allows: () => false }}
						activePath={location.pathname}
						onNavigate={(path) => {
							onNavigate(path);
							void navigate(path);
						}}
					/>
					<output aria-label="현재 경로">{location.pathname}</output>
				</>
			);
		};
		const prefix = basename === "/" ? "" : basename;
		render(
			<MemoryRouter basename={basename} initialEntries={[prefix + "/overview"]}>
				<Fixture />
			</MemoryRouter>,
		);
		const link = screen.getByRole("link", { name: "항목" });
		// When / Then: context menu가 사용하는 실제 href와 수정 클릭의 브라우저 기본 동작
		expect(link.getAttribute("href")).toBe(prefix + "/item");
		expect(fireEvent.click(link, { ctrlKey: true })).toBe(true);
		expect(fireEvent.click(link, { metaKey: true })).toBe(true);
		expect(onNavigate).not.toHaveBeenCalled();
		// When: 일반 클릭
		expect(fireEvent.click(link)).toBe(false);
		// Then: callback에는 app-local path를 전달하고 Router가 한 번만 basename 적용
		expect(onNavigate).toHaveBeenCalledExactlyOnceWith("/item");
		expect(screen.getByLabelText("현재 경로").textContent).toBe("/item");
		expect(link.getAttribute("href")).toBe(prefix + "/item");
	},
);

it("Router가 없으면 consumer의 href와 callback을 그대로 사용한다", () => {
	// Given: 독립 shell consumer
	const onNavigate = vi.fn();
	render(
		<Navigation
			itemList={[{ path: "/item", label: "항목" }]}
			permission={{ capabilityList: [], allows: () => false }}
			activePath="/"
			onNavigate={onNavigate}
		/>,
	);
	// When: 일반 클릭
	const link = screen.getByRole("link", { name: "항목" });
	fireEvent.click(link);
	// Then: 기존 Router 없는 계약 보존
	expect(link.getAttribute("href")).toBe("/item");
	expect(onNavigate).toHaveBeenCalledExactlyOnceWith("/item");
});
