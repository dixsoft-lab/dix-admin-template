import type { KeyboardEvent } from "react";

const focusableSelector = [
	"button:not(:disabled)",
	"a[href]",
	"input:not(:disabled):not([type=hidden])",
	"select:not(:disabled)",
	"textarea:not(:disabled)",
	"summary",
	'[contenteditable="true"]',
	'[tabindex]:not([tabindex="-1"])',
].join(",");

export const containDialogFocus = (event: KeyboardEvent<HTMLDialogElement>) => {
	if (event.key !== "Tab" || event.defaultPrevented) return;
	const dialog = event.currentTarget;
	const elementList = Array.from(
		dialog.querySelectorAll<HTMLElement>(focusableSelector),
	).filter((element) => {
		if (element.closest("[hidden], [inert]")) return false;
		if (element.tabIndex < 0) return false;
		let ancestor: HTMLElement | null = element;
		while (ancestor && ancestor !== dialog) {
			const style = getComputedStyle(ancestor);
			if (style.display === "none" || style.visibility === "hidden")
				return false;
			ancestor = ancestor.parentElement;
		}
		return true;
	});
	const first = elementList[0];
	const last = elementList[elementList.length - 1];
	if (!first || !last) {
		event.preventDefault();
		dialog.focus();
		return;
	}
	const focusedElement = dialog.ownerDocument.activeElement;
	if (
		event.shiftKey &&
		(focusedElement === first || focusedElement === dialog)
	) {
		event.preventDefault();
		last.focus();
		return;
	}
	if (
		!event.shiftKey &&
		(focusedElement === last || focusedElement === dialog)
	) {
		event.preventDefault();
		first.focus();
	}
};
