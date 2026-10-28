// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Combobox } from "./Combobox";

afterEach(cleanup);

it("keyboard로 disabled 항목을 건너뛰어 선택한다", () => {
	// Given: 가운데 option은 선택할 수 없다.
	const onChange = vi.fn();
	render(
		<Combobox
			label="항목"
			inputValue=""
			value={null}
			onInputChange={vi.fn()}
			onChange={onChange}
			optionList={[
				{ value: "a", label: "Alpha" },
				{ value: "b", label: "Beta", disabled: true },
				{ value: "c", label: "Gamma" },
			]}
		/>,
	);
	// When: 사용자가 아래 방향키 두 번과 Enter를 누른다.
	const input = screen.getByRole("combobox");
	fireEvent.keyDown(input, { key: "ArrowDown" });
	fireEvent.keyDown(input, { key: "ArrowDown" });
	fireEvent.keyDown(input, { key: "Enter" });
	// Then: 다음 사용 가능한 option을 알리고 popup을 닫는다.
	expect(onChange).toHaveBeenCalledExactlyOnceWith("c");
	expect(screen.queryByRole("listbox")).toBeNull();
});

it("Escape는 선택을 변경하지 않고 열린 목록을 닫는다", () => {
	// Given: 입력에 연결된 목록이 열려 있다.
	const onChange = vi.fn();
	render(
		<Combobox
			label="항목"
			inputValue=""
			value={null}
			onInputChange={vi.fn()}
			onChange={onChange}
			optionList={[]}
		/>,
	);
	const input = screen.getByRole("combobox");
	fireEvent.focus(input);
	expect(screen.getByText("선택할 항목이 없습니다.")).toBeTruthy();
	// When: 사용자가 Escape를 누른다.
	fireEvent.keyDown(input, { key: "Escape" });
	// Then: 선택 콜백 없이 popup을 닫는다.
	expect(onChange).not.toHaveBeenCalled();
	expect(input.getAttribute("aria-expanded")).toBe("false");
});
