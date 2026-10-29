// @vitest-environment jsdom
import { useState } from "react";
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SegmentedControl } from "./SegmentedControl";

afterEach(cleanup);

it("선택 버튼 상태를 소비자 state와 동기화한다", () => {
	// Given: 소비자가 선택 상태를 소유한다.
	const Consumer = () => {
		const [value, setValue] = useState("list");
		return (
			<SegmentedControl
				ariaLabel="표시 방식"
				optionList={[
					{ value: "list", label: "목록" },
					{ value: "grid", label: "카드" },
				]}
				value={value}
				onChange={setValue}
			/>
		);
	};
	render(<Consumer />);
	// When: 사용자가 다른 표현 방식을 선택한다.
	fireEvent.click(screen.getByRole("button", { name: "카드" }));
	// Then: aria-pressed 상태로 선택이 표현된다.
	expect(
		screen.getByRole("button", { name: "카드" }).getAttribute("aria-pressed"),
	).toBe("true");
	expect(
		screen.getByRole("button", { name: "목록" }).getAttribute("aria-pressed"),
	).toBe("false");
	expect(screen.getByRole("button", { name: "목록" }).className).toContain(
		"cursor-pointer",
	);
	expect(screen.getByRole("button", { name: "목록" }).className).toContain(
		"hover:bg-canvas",
	);
	expect(screen.getByRole("button", { name: "카드" }).className).toContain(
		"bg-primary",
	);
});

it("작은 크기는 USP Admin 순위 세그먼트 높이와 글자 규격을 사용한다", () => {
	render(
		<SegmentedControl
			ariaLabel="순위 기준"
			size="sm"
			optionList={[
				{ value: "views", label: "조회수" },
				{ value: "completion", label: "완료율" },
			]}
			value="views"
			onChange={() => {}}
		/>,
	);

	expect(screen.getByRole("button", { name: "조회수" }).className).toContain(
		"h-7.5 px-4 text-[12.5px]",
	);
});
