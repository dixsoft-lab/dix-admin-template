// @vitest-environment jsdom
import { afterEach, expect, it } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import { OverlayProvider } from "./OverlayProvider";
import { OverlayConfigurationError } from "./overlay-error";
import { useOverlay } from "./useOverlay";
import { installDialogStub, renderOverlay } from "./overlay-test-fixture";

installDialogStub();
afterEach(cleanup);

it("theme root 안에 host 하나를 두고 consumer token을 재정의하지 않는다", () => {
	const { api, unmount } = renderOverlay();
	const root = screen.getByTestId("theme-root");
	root.style.setProperty("--color-primary", "rgb(120, 40, 160)");
	act(() => {
		api.openModal({ title: "설정", content: "내용" });
	});
	const hostList = root.querySelectorAll("[data-overlay-host]");
	expect(hostList).toHaveLength(1);
	expect(hostList[0]?.parentElement).toBe(root);
	expect(hostList[0]?.hasAttribute("data-theme-root")).toBe(false);
	expect(root.style.getPropertyValue("--color-primary")).toBe(
		"rgb(120, 40, 160)",
	);
	expect(screen.getByRole("dialog").closest("[data-theme-root]")).toBe(root);
	unmount();
	expect(document.querySelector("[data-overlay-host]")).toBeNull();
});

it("명시한 portal root 안에서만 host를 만든다", () => {
	const root = document.createElement("section");
	root.setAttribute("data-theme-root", "");
	document.body.append(root);
	const view = render(<OverlayProvider portalRoot={root}>앱</OverlayProvider>);
	expect(root.querySelectorAll("[data-overlay-host]")).toHaveLength(1);
	view.unmount();
	expect(root.childElementCount).toBe(0);
	const replacement = render(
		<OverlayProvider portalRoot={root}>새 앱</OverlayProvider>,
	);
	expect(root.querySelectorAll("[data-overlay-host]")).toHaveLength(1);
	replacement.unmount();
	root.remove();
});

it("theme root가 없으면 document.body로 우회하지 않는다", () => {
	expect(() => render(<OverlayProvider>앱</OverlayProvider>)).toThrowError(
		"missing-theme-root",
	);
});

it("중첩 provider와 같은 theme root의 두 host를 거부한다", () => {
	expect(() =>
		render(
			<div data-theme-root="">
				<OverlayProvider>
					<OverlayProvider>중첩</OverlayProvider>
				</OverlayProvider>
			</div>,
		),
	).toThrowError("nested-provider");
	expect(() =>
		render(
			<div data-theme-root="">
				<OverlayProvider>첫째</OverlayProvider>
				<OverlayProvider>둘째</OverlayProvider>
			</div>,
		),
	).toThrowError("duplicate-host");
});

it("provider 밖의 Hook 호출은 설정 오류로 진단한다", () => {
	const InvalidConsumer = () => {
		useOverlay();
		return null;
	};
	expect(() => render(<InvalidConsumer />)).toThrowError(
		OverlayConfigurationError,
	);
});
