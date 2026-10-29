// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { ChipInput, type ChipValue } from "./ChipInput";
import { ChipInputOption } from "./ChipInputOption";
import { ChipInputOptionList } from "./ChipInputOptionList";

afterEach(cleanup);

it("ChipInput 추천 목록을 theme root에 띄우고 선택 항목을 전달한다", () => {
	const onSelect = vi.fn();
	const valueList: readonly ChipValue[] = [];
	const { container } = render(
		<div data-theme-root="">
			<ChipInput
				label="예시 태그"
				valueList={valueList}
				onRemoveValue={() => undefined}
				input={<input aria-label="태그 입력" id="tag-input" />}
				suggestionList={
					<ChipInputOptionList
						anchorId="tag-input"
						id="tag-suggestions"
						label="태그 추천"
						header="기존 태그"
					>
						<ChipInputOption detail="8개 항목" onClick={onSelect}>
							가이드
						</ChipInputOption>
					</ChipInputOptionList>
				}
			/>
		</div>,
	);

	const optionList = screen.getByRole("listbox", { name: "태그 추천" });
	expect(optionList.parentElement).toBe(
		container.querySelector("[data-theme-root]"),
	);
	expect(optionList.getAttribute("style")).toContain("position: fixed");
	fireEvent.click(screen.getByRole("option", { name: "가이드 8개 항목" }));
	expect(onSelect).toHaveBeenCalledTimes(1);
});
