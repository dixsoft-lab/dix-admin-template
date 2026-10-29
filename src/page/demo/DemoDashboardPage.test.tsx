// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DemoDashboardPage } from "./DemoDashboardPage";

afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

it("대시보드 데이터를 처음과 조회 기간 변경 뒤 300ms 동안 스켈레톤으로 표시한다", () => {
	vi.useFakeTimers();
	render(
		<MemoryRouter>
			<DemoDashboardPage />
		</MemoryRouter>,
	);

	expect(screen.getByLabelText("대시보드 데이터 불러오는 중")).toBeTruthy();
	act(() => {
		vi.advanceTimersByTime(300);
	});
	expect(screen.getByText("검수 대기")).toBeTruthy();

	fireEvent.click(screen.getByRole("button", { name: "최근 30일" }));
	expect(screen.getByLabelText("대시보드 데이터 불러오는 중")).toBeTruthy();
	act(() => {
		vi.advanceTimersByTime(299);
	});
	expect(screen.getByLabelText("대시보드 데이터 불러오는 중")).toBeTruthy();
	act(() => {
		vi.advanceTimersByTime(1);
	});
	expect(screen.getByText("최근 30일 기준")).toBeTruthy();
	expect(screen.getByText("유저스토리")).toBeTruthy();
	expect(screen.getByText("게시 중")).toBeTruthy();
	expect(screen.getByText("작성 중")).toBeTruthy();
	expect(screen.getByText("검수 요청")).toBeTruthy();
});
