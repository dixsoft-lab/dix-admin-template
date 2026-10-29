import { useId, useRef, type ReactNode } from "react";
import { Button } from "@admin/component/design-system";
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
			className="dix-admin-modal"
			data-dix-admin-overlay-surface=""
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
			<header className="dix-admin-modal-header">
				<h2 id={`${labelId}-title`}>{option.title}</h2>
				<Button
					variant="secondary"
					className="dix-admin-modal-close"
					disabled={option.isPending}
					onClick={controller.close}
				>
					{option.closeLabel ?? "닫기"}
				</Button>
			</header>
			{option.description && (
				<p
					id={`${labelId}-description`}
					className="dix-admin-modal-description"
				>
					{option.description}
				</p>
			)}
			<div className="dix-admin-modal-content">{option.content}</div>
			{option.footer != null && (
				<footer className="dix-admin-modal-footer">{option.footer}</footer>
			)}
			{children}
		</dialog>
	);
};
