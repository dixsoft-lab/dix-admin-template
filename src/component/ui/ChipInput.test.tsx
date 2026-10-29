// @vitest-environment jsdom
import { useState } from "react";
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ChipInput } from "./ChipInput";

afterEach(cleanup);

it("제거 요청을 소비자에게 전달하고 변경된 선택을 표시한다", () => {
	// Given: 선택 데이터의 소유자는 소비자다.
	const Consumer = () => {
		const [valueList, setValueList] = useState([
			{ value: "alpha", label: "Alpha", removeLabel: "Alpha 제거" },
		]);
		return (
			<ChipInput
				label="선택 항목"
				valueList={valueList}
				input={<input aria-label="항목 입력" />}
				onRemoveValue={(value) =>
					setValueList((current) =>
						current.filter((item) => item.value !== value),
					)
				}
			/>
		);
	};
	render(<Consumer />);
	// When: 사용자가 선택 chip을 제거한다.
	fireEvent.click(screen.getByRole("button", { name: "Alpha 제거" }));
	// Then: 선택 표시가 사라지고 입력은 유지된다.
	expect(screen.queryByText("Alpha")).toBeNull();
	expect(screen.getByRole("textbox", { name: "항목 입력" })).toBeTruthy();
});
