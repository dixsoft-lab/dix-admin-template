import { useId, useRef, type ReactNode } from "react";
import { Button } from "@/component/ui/Button";
import type { ActiveModal } from "./overlay-contract";
import { containDialogFocus } from "./dialog-focus";
import { useDialogLifecycle } from "./useDialogLifecycle";

type ModalViewProps = {
	readonly modal: ActiveModal;
	readonly children: ReactNode;
};

export const ModalView = ({ modal, children }: ModalViewProps) => {
	const dialogRef = useRef<HTMLDialogElement>(null);
	const labelId = useId();
	const { option, controller, opener } = modal;
	useDialogLifecycle(dialogRef, opener, modal.id);
	return (
		<dialog
			ref={dialogRef}
			className="m-auto box-border max-h-[calc(100dvh-2rem)] w-[min(32rem,calc(100vw-2rem))] max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-surface p-6 font-sans text-body text-text shadow-overlay animate-overlay-enter backdrop:bg-backdrop focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:animate-none"
			data-overlay-surface=""
			aria-modal="true"
			aria-labelledby={`${labelId}-title`}
			aria-describedby={
				option.description ? `${labelId}-description` : undefined
			}
			aria-busy={option.isPending || undefined}
			tabIndex={-1}
			onKeyDown={containDialogFocus}
			onCancel={(event) => {
				event.preventDefault();
				controller.close();
			}}
			onClose={(event) => {
				// cleanup 뒤 재열린 dialog에 이전 close event가 늦게 도착할 수 있다.
				if (event.currentTarget.open) return;
				if (option.isPending) {
					event.currentTarget.showModal();
					return;
				}
				controller.close();
			}}
			onClick={(event) => {
				if (event.target !== event.currentTarget) return;
				const bound = event.currentTarget.getBoundingClientRect();
				const outside =
					event.clientX < bound.left ||
					event.clientX > bound.right ||
					event.clientY < bound.top ||
					event.clientY > bound.bottom;
				if (outside) controller.close();
			}}
		>
			<header className="flex items-center justify-between gap-4">
				<h2
					className="m-0 text-dialog-title font-semibold"
					id={`${labelId}-title`}
				>
					{option.title}
				</h2>
				<Button
					variant="secondary"
					className="shrink-0"
					disabled={option.isPending}
					onClick={controller.close}
				>
					{option.closeLabel ?? "닫기"}
				</Button>
			</header>
			{option.description && (
				<p id={`${labelId}-description`} className="my-3 text-text-muted">
					{option.description}
				</p>
			)}
			<div className="mt-4">{option.content}</div>
			{option.footer != null && (
				<footer className="mt-6 flex justify-end gap-2">{option.footer}</footer>
			)}
			{children}
		</dialog>
	);
};
