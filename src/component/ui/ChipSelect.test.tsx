// @vitest-environment jsdom
import { useState } from "react";
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ChipSelect, type ChipSelectOption } from "./ChipSelect";
import type { ChipValue } from "./ChipInput";

afterEach(cleanup);

it("키보드로 여러 선택지를 열고 선택해 칩으로 표시한다", () => {
	const Consumer = () => {
		const [valueList, setValueList] = useState<readonly ChipValue[]>([
			{ value: "adult", label: "성인", removeLabel: "성인 제거" },
		]);
		const optionList: readonly ChipSelectOption[] = [
			{ value: "adult", label: "성인" },
			{ value: "teen", label: "청소년" },
		];
		return (
			<ChipSelect
				label="인물 카테고리"
				placeholder="카테고리 선택..."
				valueList={valueList}
				optionList={optionList}
				onChange={setValueList}
			/>
		);
	};
	const { container } = render(<Consumer />);
	const trigger = screen.getByRole("button", { name: /카테고리 선택/ });
	fireEvent.keyDown(trigger, { key: "ArrowDown" });
	const teenOption = screen.getByRole("option", { name: "청소년" });
	fireEvent.click(teenOption);
	expect(screen.getByRole("button", { name: "성인 제거" })).toBeTruthy();
	expect(screen.getByRole("button", { name: "청소년 제거" })).toBeTruthy();
	expect(
		container.querySelectorAll('[role="option"][aria-selected="true"]'),
	).toHaveLength(2);
});
