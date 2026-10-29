// @vitest-environment jsdom
import { useState } from "react";
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useCompositionGuard } from "./useCompositionGuard";

afterEach(cleanup);

it("IME 조합 중 Enter와 브라우저 조합 신호를 일반 Enter로 처리하지 않는다", () => {
	const Probe = () => {
		const composition = useCompositionGuard();
		const [commitCount, setCommitCount] = useState(0);
		return (
			<>
				<input
					aria-label="태그 입력"
					onCompositionStart={composition.handleCompositionStart}
					onCompositionEnd={composition.handleCompositionEnd}
					onKeyDown={(event) => {
						if (event.key !== "Enter" || composition.isComposing(event)) return;
						setCommitCount((current) => current + 1);
					}}
				/>
				<output>{commitCount}</output>
			</>
		);
	};

	render(<Probe />);
	const input = screen.getByRole("textbox", { name: "태그 입력" });
	const commitCount = screen.getByRole("status");

	fireEvent.compositionStart(input);
	fireEvent.keyDown(input, { key: "Enter" });
	expect(commitCount.textContent).toBe("0");

	fireEvent.compositionEnd(input);
	fireEvent.keyDown(input, { key: "Enter", isComposing: true });
	fireEvent.keyDown(input, { key: "Enter", keyCode: 229 });
	expect(commitCount.textContent).toBe("0");

	fireEvent.keyDown(input, { key: "Enter" });
	expect(commitCount.textContent).toBe("1");
});
