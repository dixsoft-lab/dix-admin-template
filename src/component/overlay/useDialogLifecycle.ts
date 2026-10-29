import { type RefObject, useLayoutEffect } from "react";

export const useDialogLifecycle = (
	dialogRef: RefObject<HTMLDialogElement | null>,
	opener: HTMLElement | null,
	identity: symbol,
) => {
	useLayoutEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		const body = dialog.ownerDocument.body;
		const previousOverflow = body.style.overflow;
		dialog.showModal();
		body.style.overflow = "hidden";
		dialog.focus();
		return () => {
			dialog.close();
			body.style.overflow = previousOverflow;
			if (opener?.isConnected) opener.focus();
		};
	}, [dialogRef, opener, identity]);
};
