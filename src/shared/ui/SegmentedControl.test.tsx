// @vitest-environment jsdom
import { useState } from "react";
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SegmentedControl } from "./SegmentedControl";

afterEach(cleanup);

it("native radio 선택을 소비자 state와 동기화한다", () => {
	// Given: 소비자가 선택 상태를 소유한다.
	const Consumer = () => {
		const [value, setValue] = useState("list");
		return (
			<SegmentedControl
				label="표시 방식"
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
	fireEvent.click(screen.getByRole("radio", { name: "카드" }));
	// Then: native checked 상태로 선택이 표현된다.
	expect(
		screen.getByRole<HTMLInputElement>("radio", { name: "카드" }).checked,
	).toBe(true);
	expect(
		screen.getByRole<HTMLInputElement>("radio", { name: "목록" }).checked,
	).toBe(false);
});
