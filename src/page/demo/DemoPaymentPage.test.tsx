// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import {
	act,
	cleanup,
	fireEvent,
	screen,
	within,
} from "@testing-library/react";
import {
	installDialogStub,
	renderOverlay,
} from "@/component/overlay/overlay-test-fixture";
import { DemoPaymentPage } from "./DemoPaymentPage";

installDialogStub();

afterEach(() => {
	cleanup();
	vi.useRealTimers();
});

it("상품·이메일·상태 조건으로 샘플 결제를 검색하고 페이지를 이동한다", () => {
	vi.useFakeTimers();
	renderOverlay(<DemoPaymentPage />);

	fireEvent.change(screen.getByLabelText("Product"), {
		target: { value: "community-fund" },
	});
	fireEvent.change(screen.getByLabelText("Email"), {
		target: { value: "mina.park" },
	});
	fireEvent.change(screen.getByLabelText("Status"), {
		target: { value: "failed" },
	});
	fireEvent.submit(screen.getByRole("form", { name: "Search payments" }));

	act(() => {
		vi.advanceTimersByTime(300);
	});

	expect(screen.getAllByText("Mina Park")).toHaveLength(3);
	expect(screen.getAllByText("FAILED")).toHaveLength(3);
	expect(screen.getByText("Showing 1–3 of 3 payments")).toBeTruthy();
});

it("상세와 상품 버튼은 공통 modal을 열어 해당 샘플 정보를 보여준다", () => {
	vi.useFakeTimers();
	renderOverlay(<DemoPaymentPage />);
	act(() => {
		vi.advanceTimersByTime(300);
	});
	fireEvent.click(screen.getByRole("button", { name: "View payment KP-1045" }));
	const detailsDialog = screen.getByRole("dialog", { name: "Payment details" });
	expect(detailsDialog).toBeTruthy();
	expect(screen.getByText("Order KP-1045")).toBeTruthy();
	expect(
		within(detailsDialog).getByText("dix.bwlee0728@gmail.com"),
	).toBeTruthy();

	fireEvent.click(screen.getByRole("button", { name: "닫기" }));
	fireEvent.click(screen.getByRole("button", { name: "Products" }));
	const productsDialog = screen.getByRole("dialog", { name: "Products" });
	expect(productsDialog).toBeTruthy();
	expect(within(productsDialog).getByText("General Donation")).toBeTruthy();
});

it("결제 요약과 표는 처음 300ms 동안 재사용 가능한 스켈레톤을 표시한다", () => {
	vi.useFakeTimers();
	renderOverlay(<DemoPaymentPage />);

	expect(screen.getByText("Loading payments")).toBeTruthy();
	act(() => {
		vi.advanceTimersByTime(299);
	});
	expect(screen.getByText("Loading payments")).toBeTruthy();

	act(() => {
		vi.advanceTimersByTime(1);
	});
	expect(screen.queryByText("Loading payments")).toBeNull();
	expect(screen.getByText("Showing 1–10 of 37 payments")).toBeTruthy();
});

it("결제 상태는 positive·neutral·negative 배지를 쓰고 native select 화살표에 여백을 둔다", () => {
	vi.useFakeTimers();
	renderOverlay(<DemoPaymentPage />);
	act(() => {
		vi.advanceTimersByTime(300);
	});

	const paidBadge = screen.getAllByText("PAID")[0];
	const pendingBadge = screen.getAllByText("PENDING")[0];
	const failedBadge = screen.getAllByText("FAILED")[0];
	expect(paidBadge?.getAttribute("class")).toContain("bg-positive!");
	expect(paidBadge?.getAttribute("class")).toContain("text-on-positive!");
	expect(pendingBadge?.getAttribute("class")).toContain("bg-surface");
	expect(pendingBadge?.getAttribute("class")).toContain("border-border");
	expect(pendingBadge?.getAttribute("class")).not.toContain("bg-warning");
	expect(failedBadge?.getAttribute("class")).toContain("bg-negative!");
	expect(failedBadge?.getAttribute("class")).toContain("text-on-negative!");

	for (const label of ["Product", "Status"]) {
		const select = screen.getByLabelText(label);
		expect(select.getAttribute("class")).toContain("appearance-none");
		expect(select.getAttribute("class")).toContain("pr-10");
		expect(
			select.parentElement?.querySelector('svg[aria-hidden="true"]'),
		).toBeTruthy();
	}
});
