import { StrictMode, useLayoutEffect, type ReactNode } from "react";
import { render } from "@testing-library/react";
import { afterAll, beforeAll } from "vitest";
import { OverlayProvider } from "./OverlayProvider";
import { useOverlay } from "./useOverlay";
import type { OverlayApi } from "./overlay-contract";

export const installDialogStub = () => {
	const showDescriptor = Object.getOwnPropertyDescriptor(
		HTMLDialogElement.prototype,
		"showModal",
	);
	const closeDescriptor = Object.getOwnPropertyDescriptor(
		HTMLDialogElement.prototype,
		"close",
	);
	beforeAll(() => {
		Object.defineProperties(HTMLDialogElement.prototype, {
			showModal: {
				configurable: true,
				value(this: HTMLDialogElement) {
					this.open = true;
				},
			},
			close: {
				configurable: true,
				value(this: HTMLDialogElement) {
					if (!this.open) return;
					this.open = false;
					window.setTimeout(() => this.dispatchEvent(new Event("close")), 0);
				},
			},
		});
	});
	afterAll(() => {
		if (showDescriptor)
			Object.defineProperty(
				HTMLDialogElement.prototype,
				"showModal",
				showDescriptor,
			);
		else Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
		if (closeDescriptor)
			Object.defineProperty(
				HTMLDialogElement.prototype,
				"close",
				closeDescriptor,
			);
		else Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
	});
};

export const renderOverlay = (child?: ReactNode) => {
	const capture: { api: OverlayApi | null } = { api: null };
	const Probe = () => {
		const api = useOverlay();
		useLayoutEffect(() => {
			capture.api = api;
		}, [api]);
		return null;
	};
	const view = render(
		<StrictMode>
			<div data-theme-root="" data-testid="theme-root">
				<OverlayProvider>
					<Probe />
					{child}
				</OverlayProvider>
			</div>
		</StrictMode>,
	);
	if (!capture.api) throw new TypeError("Overlay API가 연결되지 않았습니다.");
	return { ...view, api: capture.api };
};
