// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { HorizontalBar } from "./HorizontalBar";
import { HorizontalBarChart } from "./HorizontalBarChart";
import { VerticalBar } from "./VerticalBar";
import { VerticalBarChart } from "./VerticalBarChart";

afterEach(cleanup);

it("HorizontalBar의 표시값과 접근성 값은 범위 안으로 제한한다", () => {
	render(
		<HorizontalBar
			label="가입 계정 활성률"
			value={120}
			maxValue={100}
			valueText="120% 요청"
			tone="positive"
		/>,
	);

	const bar = screen.getByRole("progressbar", { name: "가입 계정 활성률" });
	expect(bar.getAttribute("aria-valuemax")).toBe("100");
	expect(bar.getAttribute("aria-valuenow")).toBe("100");
	expect(bar.getAttribute("aria-valuetext")).toBe("120% 요청");
	expect(bar.firstElementChild?.getAttribute("style")).toContain("width: 100%");
});

it("VerticalBar는 값에 맞는 높이와 접근성 label을 제공한다", () => {
	render(
		<VerticalBar
			label="W1 재방문율"
			value={33.33}
			valueText="33.33%"
			tone="secondary"
		/>,
	);

	const bar = screen.getByRole("progressbar", { name: "W1 재방문율" });
	expect(bar.getAttribute("aria-valuenow")).toBe("33.33");
	expect(bar.firstElementChild?.getAttribute("style")).toContain(
		"height: 33.33%",
	);
});

it("완성형 차트는 itemList 값과 공통 formatter, 항목별 표시 문구를 적용한다", () => {
	render(
		<div>
			<HorizontalBarChart
				title="부서별 가입 계정 활성률"
				itemList={[
					{
						id: "mi-planning",
						label: "MI기획팀",
						value: 66.67,
					},
					{
						id: "operations",
						label: "운영팀",
						value: 100,
						displayValue: "1/1 · 100%",
					},
				]}
				valueFormatter={(value) => `${value}%`}
			/>
			<VerticalBarChart
				title="주차별 재방문율"
				itemList={[
					{
						id: "w1",
						label: "W1",
						value: 33.33,
					},
				]}
				valueFormatter={(value) => `${value}%`}
			/>
		</div>,
	);

	expect(
		screen.getByRole("region", { name: "부서별 가입 계정 활성률" }),
	).toBeTruthy();
	expect(screen.getByText("66.67%")).toBeTruthy();
	expect(screen.getByText("1/1 · 100%")).toBeTruthy();
	expect(
		screen
			.getByRole("progressbar", {
				name: "MI기획팀 부서별 가입 계정 활성률",
			})
			.getAttribute("aria-valuetext"),
	).toBe("66.67%");
	expect(screen.getByRole("region", { name: "주차별 재방문율" })).toBeTruthy();
	expect(screen.getByText("33.33%")).toBeTruthy();
	expect(
		screen.getByRole("progressbar", { name: "W1 주차별 재방문율" }),
	).toBeTruthy();
});
