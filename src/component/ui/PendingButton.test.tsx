// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { PendingButton } from "./PendingButton";

afterEach(cleanup);

it("pending 동안 중복 클릭을 차단하고 busy 상태를 알린다", () => {
	// Given: 소비자가 처리 중 상태를 제공한다.
	const onClick = vi.fn();
	render(
		<PendingButton pending onClick={onClick}>
			저장
		</PendingButton>,
	);
	// When: 사용자가 처리 중 버튼을 누른다.
	fireEvent.click(screen.getByRole("button", { name: "저장" }));
	// Then: 명령을 중복 실행하지 않는다.
	expect(onClick).not.toHaveBeenCalled();
	expect(screen.getByRole("button").getAttribute("aria-busy")).toBe("true");
});
