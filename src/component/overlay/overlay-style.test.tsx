// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, expect, it } from "vitest";
import { act, cleanup, screen } from "@testing-library/react";
import { installDialogStub, renderOverlay } from "./overlay-test-fixture";

installDialogStub();
afterEach(cleanup);

it("실제 overlay class에 reduced-motion 규칙이 연결된다", () => {
	const style = document.createElement("style");
	style.textContent = readFileSync(
		resolve(import.meta.dirname, "overlay.css"),
		"utf8",
	);
	document.head.append(style);
	try {
		const { api } = renderOverlay();
		act(() => {
			api.openModal({ title: "동작", content: "내용" });
			api.showToast({ message: "알림", durationMs: 0 });
		});
		const dialog = screen.getByRole("dialog");
		const toast = screen.getByText("알림").parentElement;
		const sheet = style.sheet;
		if (!sheet || !toast)
			throw new TypeError("overlay stylesheet가 연결되지 않았습니다.");
		const mediaRule = Array.from(sheet.cssRules).find(
			(rule) =>
				rule instanceof CSSMediaRule &&
				rule.conditionText === "(prefers-reduced-motion: reduce)",
		);
		if (!(mediaRule instanceof CSSMediaRule))
			throw new TypeError("reduced-motion media rule이 없습니다.");
		const rule = Array.from(mediaRule.cssRules).find(
			(entry) =>
				entry instanceof CSSStyleRule &&
				dialog.matches(entry.selectorText) &&
				toast.matches(entry.selectorText),
		);
		if (!(rule instanceof CSSStyleRule))
			throw new TypeError("overlay class의 motion rule이 없습니다.");
		expect(rule.style.animation).toBe("none");
		expect(rule.style.transition).toBe("none");
	} finally {
		style.remove();
	}
});
