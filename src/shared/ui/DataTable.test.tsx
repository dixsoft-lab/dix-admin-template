// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DataTable } from "./DataTable";

afterEach(cleanup);
const rowList = [
	{ key: "a", name: "Alpha" },
	{ key: "b", name: "Beta" },
];
const columnList = [
	{
		key: "name",
		header: "이름",
		render: (row: (typeof rowList)[number]) => row.name,
	},
];

it("전체 선택이 다른 페이지의 선택 값을 보존한다", () => {
	// Given: 현재 페이지 밖의 항목이 이미 선택돼 있다.
	const onChange = vi.fn();
	render(
		<DataTable
			caption="항목 목록"
			rowList={rowList}
			columnList={columnList}
			rowKey={(row) => row.key}
			selection={{
				selectedKeyList: ["other-page"],
				onChange,
				label: "전체 선택",
				rowLabel: (row) => row.name + " 선택",
			}}
		/>,
	);
	// When: 현재 페이지의 전체 선택을 누른다.
	fireEvent.click(screen.getByRole("checkbox", { name: "전체 선택" }));
	// Then: 현재 페이지 값과 기존 선택을 함께 소비자에게 전달한다.
	expect(onChange).toHaveBeenCalledExactlyOnceWith(["other-page", "a", "b"]);
});

it("pending 상태에서는 행 선택이 실행되지 않는다", () => {
	// Given: table이 처리 중이다.
	const onChange = vi.fn();
	render(
		<DataTable
			pending
			caption="항목 목록"
			rowList={rowList}
			columnList={columnList}
			rowKey={(row) => row.key}
			selection={{
				selectedKeyList: [],
				onChange,
				label: "전체 선택",
				rowLabel: (row) => row.name + " 선택",
			}}
		/>,
	);
	// When: 사용자가 행 선택을 누른다.
	screen
		.getByRole<HTMLInputElement>("checkbox", { name: "Alpha 선택" })
		.click();
	// Then: 선택 변경이 발생하지 않는다.
	expect(onChange).not.toHaveBeenCalled();
	expect(
		screen.getByRole<HTMLInputElement>("checkbox", { name: "Alpha 선택" })
			.disabled,
	).toBe(true);
});

it("비어 있는 table은 열 수에 맞는 빈 상태를 표시한다", () => {
	// Given: 소비자가 빈 목록을 전달한다.
	// When: table을 렌더링한다.
	render(
		<DataTable
			caption="항목 목록"
			rowList={[]}
			columnList={columnList}
			rowKey={(row) => row.key}
			emptyLabel="아직 항목이 없습니다."
		/>,
	);
	// Then: 의미 있는 빈 상태를 표시한다.
	expect(
		screen
			.getByRole("cell", { name: "아직 항목이 없습니다." })
			.getAttribute("colspan"),
	).toBe("1");
});
