// @vitest-environment jsdom
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { AsyncState } from "./AsyncState";

afterEach(cleanup);

it("오류 복구를 consumer action에 맡기고 성공한 내용을 표시한다", () => {
	// Given: consumer가 오류 상태와 복구 action을 제공한다.
	const Consumer = () => {
		const [state, setState] = useState<"error" | "success">("error");
		return (
			<AsyncState
				state={state}
				loading="불러오는 중"
				empty="항목 없음"
				error={<button onClick={() => setState("success")}>다시 시도</button>}
			>
				<p>준비된 내용</p>
			</AsyncState>
		);
	};
	render(<Consumer />);
	expect(screen.getByRole("alert")).toBeTruthy();
	// When: 사용자가 consumer의 복구 action을 실행한다.
	fireEvent.click(screen.getByRole("button", { name: "다시 시도" }));
	// Then: 오류 안내를 제거하고 전달받은 내용을 표시한다.
	expect(screen.queryByRole("alert")).toBeNull();
	expect(screen.getByText("준비된 내용")).toBeTruthy();
});
